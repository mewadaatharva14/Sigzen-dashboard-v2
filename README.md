<div align="center">

# ⚡ Sigzen BI — AI-Native Business Intelligence for ERP

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Ollama](https://img.shields.io/badge/Ollama-llama3.1-000000?style=flat&logo=ollama&logoColor=white)](https://ollama.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-RAG-FF6F61?style=flat)](https://www.trychroma.com/)
[![License](https://img.shields.io/badge/License-MIT-00C28B?style=flat)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-mewadaatharva14-181717?style=flat&logo=github)](https://github.com/mewadaatharva14)

> **An open-source, privacy-first "PowerBI for ERP."** Connect any ERP with just API
> credentials and get a live executive dashboard — plus a local-LLM assistant that
> answers questions about your data *and* teaches you how the ERP works, with citations.
> No data ever leaves your machine.

</div>

---

## 🎯 Overview

Sigzen BI unifies two worlds on a **single page**, switchable like a theme toggle:

- **📊 Supabase mode** — historical Business-Intelligence datasets (finance, clients,
  employees, projects, NPS, risk) queried in natural language via **text-to-SQL**.
- **⚡ ERP mode** — a **live** connection to ERPNext (Frappe Cloud) streaming real-time
  accounting, sales, procurement, inventory, projects and support data.

What makes it more than a dashboard is the **AI layer**: a fully local assistant
(Ollama) that routes every question to the right "brain" — write SQL over the history,
ground answers on the live ERP snapshot, or retrieve from a 449-document ERPNext
knowledge base. All on-device. No OpenAI, no cloud inference, no leaked schemas.

---

## ✨ Highlights

| | Capability | Why it stands out |
|---|---|---|
| 🔌 | **Pluggable ERP drivers** | A connector/registry pattern — adding Oracle or SAP is *one class + one line*, zero changes to routes or UI. |
| 🧠 | **Three-brain, intent-routed AI** | A classifier sends each question to text-to-SQL, live-data grounding, or docs-RAG — automatically. |
| 📚 | **Cited RAG help system** | 449 ERPNext docs → 955 embedded chunks; "how-to" answers come back with source links. |
| 🔐 | **Privacy-first by design** | ERP credentials live only in memory (TTL); the LLM runs locally — nothing is sent to third parties. |
| 🎛️ | **Dual-source single page** | Supabase ⟷ ERP toggle, mode-scoped year filter, per-mode chat threads. |
| 💸 | **Zero inference cost** | Runs `llama3.1:8b` + `nomic-embed-text` on a laptop CPU — one model serves SQL *and* chat. |

---

## 🏗️ Architecture

```text
                         ┌──────────────────────────────────────────┐
                         │            Browser (Next.js 16)          │
                         │   Supabase ⟷ ERP toggle · AI ChatPanel   │
                         └───────────────┬──────────────────────────┘
                                         │  REST (only talks to backend)
                         ┌───────────────▼──────────────────────────┐
                         │              FastAPI backend             │
                         │                                          │
   ┌─────────────────────┤   intent_router  ──►  classify question  │
   │                     │        │                                 │
   │   "data" (history)  │        ├──► ai/vanna_setup ─► text-to-SQL │──► Supabase (PostgreSQL)
   │   "data" (live ERP) │        ├──► ai/erp_ai ─► grounded answer  │──┐
   │   "help" (concept)  │        └──► ai/docs_rag ─► cited RAG      │  │  connectors/registry
   │                     │                                          │  │        │
   └─────────────────────┤   routes/erp ─► generic /{module}/{res}  │──┴──► connectors/erpnext ──► ERPNext REST
                         │   core/session_store (in-memory creds)   │
                         └───────────────┬──────────────────────────┘
                                         │
                         ┌───────────────▼──────────────────────────┐
                         │   Ollama (local)   ·   ChromaDB (local)   │
                         │   llama3.1:8b + nomic-embed-text          │
                         └──────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
sigzen-dashboard-v2/
├── frontend/                        # Next.js 16 · React 19 · TypeScript · Tailwind v4
│   ├── app/
│   │   ├── page.tsx                 # Single-page dashboard (Supabase ⟷ ERP toggle)
│   │   ├── connect/                 # ERP credential connect flow
│   │   └── login/                   # Supabase auth
│   ├── components/dashboard/
│   │   ├── Header.tsx               # Data-source toggle + mode-aware year filter
│   │   ├── DashboardGrid.tsx        # Mode-aware module layout
│   │   ├── ChatPanel.tsx            # Mode-scoped AI assistant (data + help + sources)
│   │   ├── ERPKpiRow.tsx            # Live ERP KPI cards
│   │   └── modules/                 # 7 Supabase modules + 6 live ERPNext modules
│   └── lib/                         # API clients, year + ERP-session context
│
├── backend/                         # FastAPI · Vanna · Ollama · ChromaDB
│   ├── main.py                      # App entry · Supabase data + /api/chat (text-to-SQL)
│   ├── connectors/                  # ── Driver manager (pluggable ERPs) ──
│   │   ├── base.py                  #    BaseConnector interface
│   │   ├── registry.py              #    ERP type → connector class
│   │   └── erpnext/                 #    ERPNext driver (Oracle / SAP = future siblings)
│   │       └── connector.py         #    auth · 19 report capabilities · normalizers
│   ├── routes/erp.py                # Generic ERP API + /api/erp/chat (intent-routed)
│   ├── ai/                          # ── All LLM logic ──
│   │   ├── intent_router.py         #    data ⟷ help classification
│   │   ├── erp_ai.py                #    live-ERP context-grounded answers
│   │   ├── docs_rag.py              #    ERPNext docs RAG (with citations)
│   │   └── vanna_setup.py           #    Supabase text-to-SQL training
│   ├── core/session_store.py        # In-memory credential sessions (8h TTL)
│   └── scripts/ingest_erpnext_docs.py
│
└── data/
    ├── *.sql                        # BI schema + multi-year sample datasets
    └── erpnext_docs/                # 449-doc ERPNext knowledge base (RAG source)
```

---

## 🧠 The AI System

Every chat message is classified, then routed to the brain best suited to answer it.

| Question type | Example | Brain | Mechanism |
|---|---|---|---|
| **History / SQL** | *"Compare revenue across all years"* | `vanna_setup` | Text-to-SQL over the BI schema, executed on Supabase |
| **Live ERP data** | *"What's my outstanding receivables?"* | `erp_ai` | Grounds the model on a cached live ERP snapshot |
| **Conceptual / how-to** | *"How do I create a Sales Invoice?"* | `docs_rag` | Retrieves from the docs KB, answers **with source links** |

**Reliability engineering** that makes a small local model trustworthy:

- **Pre-computed numbers** — figures are calculated in Python; the model only narrates,
  never does arithmetic.
- **Pre-formatted currency** — money arrives as `"₹88.30 Lakh"` so the LLM can't fumble
  Lakh/Crore conversions.
- **Unambiguous key-figure mapping + glossary** — e.g. `"receivables" ≠ "received"`.
- **Year-aware** — a year named in the question ("…for 2025") overrides the dashboard
  filter and re-fetches that period.
- **Boundary-honest** — when the snapshot can't answer (e.g. row-level history), it says so
  instead of hallucinating.

---

## 🔌 Multi-ERP Connector Architecture

The backend never hard-codes ERPNext. Everything goes through a `BaseConnector`
interface resolved by a registry:

```python
# Adding a new ERP = one class + one registry line. Routes & frontend unchanged.
CONNECTOR_REGISTRY = {
    "erpnext": ERPNextConnector,   # ✅ live
    # "oracle": OracleConnector,   # 🔜 drop in connectors/oracle/, register here
    # "sap":    SAPConnector,      # 🔜
}
```

A single generic endpoint — `/api/session/{id}/{module}/{resource}` — serves every ERP,
because each connector exposes the same capability map (`accounting`, `sales`, `inventory`,
`projects`, `support`, …) and `{data, summary}` report shape.

---

## ⚙️ Tech Stack

**Frontend** — Next.js 16 (App Router) · React 19 · TypeScript 5.7 · Tailwind CSS v4 ·
Radix UI (shadcn) · Recharts · Lucide

**Backend** — FastAPI · Python 3.11+ · Vanna 0.7 (text-to-SQL) · Ollama (`llama3.1:8b`,
`nomic-embed-text`) · ChromaDB (vector store) · Pydantic

**Data & Infra** — Supabase (PostgreSQL + Auth) · ERPNext / Frappe Cloud REST · local LLM
inference · Vercel-ready frontend

---

## 🚀 Setup & Run

### Prerequisites
```bash
# Install Ollama (ollama.com), then pull the models:
ollama pull llama3.1:8b          # serves SQL + chat
ollama pull nomic-embed-text     # docs RAG embeddings
ollama serve
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate                 # Windows  (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt

cp .env.example .env                  # fill in Supabase + ERPNext (optional) keys
python scripts/ingest_erpnext_docs.py # one-time: build the docs knowledge base
python -m uvicorn main:app --port 8000
```

### Frontend
```bash
cd frontend
pnpm install
cp .env.example .env.local            # fill in Supabase + backend API URL
pnpm dev                              # http://localhost:3000
```

> First chat answer loads the model into RAM (~20–40s on CPU); it stays warm afterward.

---

## 🔑 Environment Variables

**Backend (`backend/.env`)**

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` / `SUPABASE_KEY` | BI database + auth |
| `OLLAMA_HOST` | Ollama endpoint (default `http://localhost:11434`) |
| `OLLAMA_MODEL` / `OLLAMA_CHAT_MODEL` | SQL model / chat model (both `llama3.1:8b`) |
| `OLLAMA_EMBED_MODEL` | RAG embeddings (`nomic-embed-text`) |
| `ERPNEXT_*` | Optional `.env` fallback; the app prefers UI-entered credentials |
| `FRONTEND_URL` | CORS origin |

**Frontend (`frontend/.env.local`)** — `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`.

> 🔒 ERP API keys entered in the UI are **never persisted** — they live in an in-memory
> session (8h TTL) and are dropped on disconnect.

---

## 📡 API Endpoints (selected)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health |
| `POST` | `/api/chat` | Supabase natural-language → SQL |
| `GET` | `/api/financial/{year}` · `/api/revenue/{year}` · `/api/clients/{year}` | Historical BI data |
| `GET` | `/api/connectors` | List supported ERPs + credential fields |
| `POST` | `/api/connect` | Validate ERP credentials, open a session |
| `GET` | `/api/session/{id}/{module}/{resource}` | Generic live ERP report (any ERP) |
| `POST` | `/api/erp/chat` | Intent-routed ERP assistant (live data **or** docs RAG) |

---

## 💡 Key Implementation Details

**Why a connector/registry pattern instead of ERPNext calls in the API layer?**
Each ERP's quirks (auth, DocTypes, field permissions) stay isolated in one driver. The HTTP
layer and frontend speak a single generic contract, so onboarding a new ERP is additive,
not invasive.

**Why context-grounded answers for ERP instead of text-to-SQL?**
ERPNext data is REST JSON, not a queryable SQL database — there's no schema for Vanna to
target. So the ERP brain grounds the model on pre-computed live summaries instead. Different
data shape → different mechanism.

**Why one local model for everything?**
On commodity hardware (a GPU-less laptop), running separate SQL and chat models thrashes RAM
and forces a reload on every mode switch. One warm `llama3.1:8b` serves both — half the
memory, no swap latency, and zero inference cost.

**Why pre-format numbers in Python before the LLM sees them?**
Small models are unreliable at arithmetic and Indian-currency formatting. Computing the
figures up front and handing the model ready strings to quote eliminates a whole class of
"confidently wrong number" errors.

**Why keep credentials in memory only?**
A BI tool that asks for ERP keys must never become a credential store. In-memory sessions
with a TTL mean a process restart wipes them — the safest default.

---

## 🗺️ Roadmap

- [x] Dual-source dashboard (Supabase + live ERPNext)
- [x] Three-brain, intent-routed local AI (SQL · live-data · docs RAG)
- [x] Pluggable ERP driver architecture
- [ ] Streaming chat responses (token-by-token)
- [ ] Additional ERP connectors (Oracle, SAP)
- [ ] Deeper ERP time-series for trend questions

---

## 📚 References

| Resource | Link |
|---|---|
| Next.js | [nextjs.org/docs](https://nextjs.org/docs) |
| FastAPI | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/) |
| Vanna AI (text-to-SQL) | [vanna.ai/docs](https://vanna.ai/docs/) |
| Ollama | [ollama.com/library](https://ollama.com/library) |
| ChromaDB | [trychroma.com](https://www.trychroma.com/) |
| ERPNext / Frappe | [docs.frappe.io/erpnext](https://docs.frappe.io/erpnext) |

---

## 📝 License

Released under the [MIT License](LICENSE).

---

<p align="center">
  Made with 🧠 by <a href="https://github.com/mewadaatharva14">mewadaatharva14</a>
</p>
