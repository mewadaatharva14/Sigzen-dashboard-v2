# Sigzen BI — AI Integration Report (v1)

**Scope of this report:** the AI assistant work completed in this session — making
the dashboard's chat assistant work against **both** data sources (Supabase
historical BI + live ERPNext), scoped to the active view mode, running fully on
a **local Ollama** model.

> Status: **v1 complete and working.** Focused on "make the AI answer correctly
> from the database." Polish (streaming, deeper trends) is deferred to the
> post-review pass.

---

## 1. What we set out to do

The dashboard already had a **Supabase / ERP view toggle** (two mutually-exclusive
single-page dashboards). The goal this session: give **each mode its own AI chat**,
just like the toggle — so the assistant always answers from the world the user is
looking at, using a free local model (Ollama) since Grok/Gemini were unavailable.

---

## 2. The core architectural decision

The two modes need **fundamentally different AI mechanisms**, because the data
shapes differ:

| Mode | Data shape | AI mechanism |
|---|---|---|
| **Supabase** | SQL database (17 tables) | **Text-to-SQL** via Vanna — model writes SQL, we run it |
| **ERP** | REST API JSON (report summaries) | **Context-grounded** — feed live figures to the model, it narrates |

**Why ERP does NOT use Vanna:** Vanna's entire purpose is generating SQL against a
schema. ERPNext data isn't a queryable SQL DB — it arrives as REST JSON. There's
nothing for Vanna to write SQL against. So ERP uses a different, correct approach:
gather the already-computed summaries and let the model answer from them.

**Why context-grounded over tool-calling for ERP:** tool-calling would make the
model hit the (slow) ERPNext API multiple times per question. Context-grounded
fetches once, caches, and answers — far faster and more reliable on a small local
model.

```
ChatPanel (reads viewMode)
   │
   ├─ Supabase → POST /api/chat      → Vanna → Ollama → SQL → Supabase → answer
   │
   └─ ERP      → POST /api/erp/chat  → erp_ai → Ollama → plain-English answer
                                          ▲
                       all Ollama calls are BACKEND-ONLY (browser never sees :11434)
```

---

## 3. The model setup (tuned for the target hardware)

Target machine: **Intel i7-8665U, 16GB RAM, no dedicated GPU (Intel UHD 620)**.

Decision: **one model serves both jobs** — `llama3.1:8b`. Running two different
models would thrash RAM and force a slow reload every time the user switches mode.
One model = loads once, stays warm, ~5GB RAM.

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b        # Supabase text-to-SQL (Vanna)
OLLAMA_CHAT_MODEL=llama3.1:8b   # ERP context-grounded chat
```

Trade-off accepted: `llama3.1:8b` is marginally weaker at SQL than a dedicated
coder model, but it's a strong all-rounder and the single-model simplicity is
worth far more on a GPU-less laptop. Expect ~20-40s for the first answer (model
load); follow-ups stay fast for 30 min via `keep_alive`.

---

## 4. Files changed / added

### Backend
| File | Change |
|---|---|
| `backend/erp_ai.py` | **NEW.** The ERP assistant: gathers session summaries, caches them, builds the prompt, calls Ollama. |
| `backend/routes/erp.py` | Added `POST /api/erp/chat`; cache invalidated on disconnect. |
| `backend/.env` / `.env.example` | Documented the two model vars; set both to `llama3.1:8b`. |
| `backend/main.py` | Untouched — Supabase `/api/chat` (Vanna) kept as-is. |

### Frontend
| File | Change |
|---|---|
| `frontend/components/dashboard/ChatPanel.tsx` | Made **mode-aware**: routes to the right endpoint, mode-colored UI, mode-specific suggestions, separate chat threads per mode, "Connect your ERP to chat" state when ERP not connected. |
| `frontend/app/page.tsx` | Passes `viewMode` to `<ChatPanel />`. |

**Untouched (by design):** `session-context.tsx`, `erpnext-api.ts`, the connectors,
the view toggle, and all dashboard modules.

---

## 5. How `erp_ai.py` works (the heart of v1)

1. **Gather** — pulls 14 module summaries (sales, accounting, procurement,
   inventory, projects, support) via the connector — the *same numbers* shown on
   the dashboard cards. Only the small `summary` payloads, not raw rows.
2. **Cache** — per-session snapshot with a **90-second TTL**, so follow-up
   questions don't re-hit slow ERPNext. First question fetches; the next ones
   within the window reuse the snapshot.
3. **Ground** — builds a `KEY_FIGURES` block with **unambiguous names** + a full
   `MODULE_DETAILS` block, and asks `llama3.1:8b` to answer **only** from these
   facts. The model narrates; it never calculates.

**Reliability tricks (the important part):**
- **Pre-computed numbers** — the model never does arithmetic; every figure is
  computed in Python first.
- **Pre-formatted currency** — money is formatted to Indian style (`₹88.30 Lakh`)
  in Python so the model just quotes it. (Small models fumble Lakh/Crore math.)
- **Glossary in the prompt** — maps the user's words to the right field
  (e.g. *"receivables ≠ received"*).
- **Year stamping + year parsing** — the snapshot declares its year, and a year
  named in the question (e.g. *"...for 2025"*) overrides the dashboard's selected
  year, so users can pull any year without changing the filter.

---

## 6. Testing — what we found and fixed

Live testing against the connected ERPNext (`erpnext-dqa-smv.m.frappe.cloud`)
surfaced real bugs, each fixed:

| Test question | First result | Cause | Fix |
|---|---|---|---|
| "Sales orders summary" | ✅ 40 orders, ₹6.94 Cr, breakdown | — | worked first try |
| "How many leads / where from" | ✅ 20, all India | — | worked first try |
| "Sales growth last 6 months" | ✅ politely declined | — | boundary check passed |
| "Total outstanding receivables" | ❌ `0.0 INR` | model matched *receivables → received(0)* | `KEY_FIGURES` + glossary |
| "Total invoiced 2025" | ❌ "snapshot only has 2026" / "8.83 Lakh" | no year stamp + bad Lakh math | year stamp + pre-formatted money |
| Ask another year without changing dropdown | ❌ not possible | no year parsing | parse year from question |

**Verified offline after fixes:** `8,830,000 → ₹88.30 Lakh`, `69,400,000 → ₹6.94 Cr`,
`"of 2025" → 2025`, `"how many suppliers" → None`.

---

## 7. What each mode can / can't answer

**Supabase mode (text-to-SQL):** strong at history, trends, ranking, multi-year
joins. Weak at: live ERP data, untrained tables.
- ✅ "Compare revenue across all years", "Top 10 clients by contract value",
  "How many projects are delayed?", "Average NPS this year"

**ERP mode (context-grounded snapshot):** strong at "what's true right now" —
totals, counts, status breakdowns, and reasoning over them. Weak at: deep
historical trends, row-level drill-down not in the summary.
- ✅ "Outstanding receivables?", "Unpaid invoices?", "Active suppliers?",
  "Open vs completed tasks?", "Break down opportunities by status",
  "Summarize my ERP health"
- ⛔ "Show invoice INV-0042's line items" (not in snapshot — declines correctly)

---

## 8. How to run

**One-time:**
```bash
ollama pull llama3.1:8b          # the only model needed
```

**Each session:**
```bash
ollama serve                                   # terminal 1
# backend (terminal 2):
cd backend && ./venv/Scripts/python.exe -m uvicorn main:app --port 8000
# frontend (terminal 3):
cd frontend && pnpm dev
```

**One-time Supabase brain (for Supabase-mode chat):**
```
POST http://localhost:8000/api/train
```

Then: open the app → toggle **Supabase**/**ERP** in the header → open the chat
bubble (bottom-right). In ERP mode you must be connected (green "Live" badge);
otherwise the chat shows a connect prompt.

---

## 9. Deferred to post-review (intentionally not in v1)

- **Token streaming** — show the answer word-by-word instead of waiting for the
  full response. Biggest perceived-speed win; held back to keep v1 robust.
- **Deeper ERP trends** — include a few months of time-series in the snapshot so
  ERP chat can answer "last 3 months" questions (currently current-state only).
- **Prompt tuning** — more glossary terms, richer "ERP health" reasoning.
- **Supabase modules year-awareness** and other pre-existing backlog items.

---

## 10. Security note (unchanged, still holds)

- ERP credentials live **only in an in-memory session** (8h TTL) — never written
  to disk, DB, or logs.
- All Ollama calls are **backend-only**; the browser never connects to the model
  or sees credentials.
- The chat snapshot uses only **aggregated summaries**, not raw records.

---

*Report generated at the end of the v1 AI-integration session.*
