# ERPNext / Frappe HR Documentation — Knowledge Base (Handoff)

**Added:** 2026-06-11
**Source scraper:** `D:\ERPNext` (separate project — re-runnable, not part of this repo)
**Location:** `data/erpnext_docs/`
**Files:** 449 cleaned Markdown docs + `manifest.jsonl`

This folder is a **conceptual knowledge base** scraped from the official Frappe docs.
It is meant for *"how does X work in ERPNext?"* style questions — **not** for the
text-to-SQL path.

---

## 1. Where it came from
- ERPNext modules scraped from `https://docs.frappe.io/erpnext`:
  **Accounting, Assets, Buying, Selling, Stock** (pre-existing) +
  **CRM, Projects, Manufacturing, Support** (added).
- **HR** was scraped from `https://docs.frappe.io/hr` — Frappe spun HR out into a
  separate product, so it does **not** live under `/erpnext`. It is filed here under
  `HR/` for convenience.

## 2. File format
Every `.md` file has YAML frontmatter followed by the cleaned article body:

```yaml
---
title: Leave Block List
url: https://docs.frappe.io/hr/leave-block-list
module: HR
submodule: Leave_Management
---
<markdown body>
```

- `url`   → use as the **citation / source link** in answers.
- `module` / `submodule` → use as **metadata filters** at retrieval time.
- Files are named by **URL slug** (e.g. `leave-block-list.md`) so same-titled pages
  never collide.

## 3. Per-module counts
| Module        | Files |
|---------------|------:|
| Accounting    | 88 |
| HR            | 154 |
| Manufacturing | 57 |
| CRM           | 30 |
| Projects      | 30 |
| Selling       | 25 |
| Buying        | 21 |
| Assets        | 16 |
| Stock         | 14 |
| Support       | 14 |
| **Total**     | **449** |

## 4. Cleaning already applied (so you don't have to)
- Ghost/empty files removed (0 remain; min body length 100 chars).
- Site UI junk stripped: `Edit`, `Download`, `Copy page`, `Open in ChatGPT/Claude`,
  `Was this helpful?`, heading anchor artifacts (`[#](#...)`).
- Titles normalized: missing/`No Title` titles derived from the URL slug; markdown
  formatting stripped from titles.

## 5. `manifest.jsonl`
One JSON object per line — a ready-made ingestion index:
```json
{"file": "HR/Leave_Management/leave-block-list.md", "title": "Leave Block List",
 "url": "https://docs.frappe.io/hr/leave-block-list", "module": "HR",
 "submodule": "Leave_Management", "char_count": 1234}
```

## 6. Recommended ingestion — USE A SEPARATE COLLECTION
> ⚠️ **Do NOT load these into the Vanna `sigzen_bi` collection.** That collection
> exists to help the model write correct SQL against the BI tables. Flooding it with
> 449 conceptual help articles will add retrieval noise and **degrade SQL accuracy**.

Instead create a dedicated docs collection in the same Chroma store
(`backend/chroma_db`) and route concept questions to it (e.g. via `intent_router.py`:
data/metric questions → Vanna SQL; "how/what/why does ERPNext..." → docs RAG).

A ready-to-run ingester is provided at **`backend/ingest_erpnext_docs.py`**:
```bash
cd backend
python ingest_erpnext_docs.py        # builds collection "erpnext_docs"
```
It chunks each doc, embeds with Chroma's default embedder, and stores
`{title, url, module, submodule}` as metadata on every chunk for citations.
