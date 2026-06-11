# Sigzen BI — ERPNext Dashboard Report

**Scope:** the **live ERPNext** side of the dashboard only — the connection flow,
the ERP view mode, the KPI row, the six live modules, and the backend driver
architecture that powers them. *(Supabase/historical side intentionally excluded.)*

---

## 1. What the ERPNext dashboard is

A **live operations dashboard** that streams real-time data straight from an
ERPNext / Frappe Cloud instance into the same single page as the rest of Sigzen
BI. The user enters their ERPNext credentials once through the UI, and the
dashboard renders live accounting, sales, procurement, inventory, projects and
support data — no data is copied into our database; every figure is fetched live
from ERPNext on demand.

Positioned like "PowerBI for ERP": connect with credentials → instant charts.

---

## 2. How a user gets here (connection flow)

```
Header toggle → "ERP" mode
   │
   ├─ Not connected → "Connect your ERP" prompt  →  /connect page
   │                                                   │  enter URL + API key + secret
   │                                                   ▼
   │                                          POST /api/connect (validates live)
   │                                                   │  success → in-memory session
   │                                                   ▼
   └─ Connected → green "Live ERP Connected" banner + live dashboard
```

- **`/connect` page** — credential form (ERPNext URL, API key, API secret). On
  submit it validates against the live ERP before opening a session.
- **Session** — a secure `session_id` is stored; credentials live **only in
  backend memory** (8-hour TTL), never on disk/DB/logs. The browser keeps just
  the opaque session id in `localStorage` (`sigzen_erp_session`).
- **DataSourceBanner** — a green "Live ERP Connected: Erpnext (host)" bar with a
  "Data as of" timestamp and a **Disconnect** button. Shows only in ERP mode when
  a session is live.

---

## 3. The ERP view mode (header toggle)

A segmented **Supabase ⟷ ERP** toggle in the header (like the theme switch).
The two views are **mutually exclusive** on one page:

- Toggle persists to `localStorage` (`dashboard-view-mode`).
- In ERP mode the header shows an **ERP connection badge** (green "Live" when
  connected, "Connect ERP" otherwise) and a **year filter scoped to ERP years**.
- Switching modes auto-corrects the selected year so modules never render blank.

---

## 4. Top KPI row (ERP mode)

Four headline cards (`ERPKpiRow`) pulled live from the connected ERP:

| Card | Source | Example |
|---|---|---|
| **Total Invoiced** | Sales invoices, selected year | ₹88.3L |
| **Outstanding** | Receivables pending | ₹88.3L (100% of invoiced) |
| **Active Suppliers** | Supplier master | 46 |
| **Open Tasks** | Task workload | live count |

---

## 5. The six live modules

All six follow the same pattern: a titled card, tabbed sub-views, KPI tiles,
Recharts visualizations, and graceful **offline / empty / not-connected** states.

| Module | Tabs / sub-views | Live ERPNext source |
|---|---|---|
| **ERPNext Accounting** | Sales Invoices · Purchase Invoices · Payments · Journal Entries | Sales/Purchase Invoice, Payment Entry, Journal Entry |
| **Sales & CRM** | Leads · Opportunities · Quotations · Orders | Lead, Opportunity, Quotation, Sales Order |
| **Procurement** | Purchase Orders · Suppliers | Purchase Order, Supplier |
| **Inventory** | Stock Levels · Delivery Notes · Purchase Receipts | Bin/Stock, Delivery Note, Purchase Receipt |
| **Projects** | Tasks · Projects | Task, Project |
| **Support** | Issues | Issue |

Each tab shows summary tiles (totals, status counts, values) and charts derived
from that DocType, plus an export of the underlying rows.

The **Customize panel** groups these under **"Live ERP Modules"** (separate from
the historical modules), so the user can show/hide each one. By default
Accounting, Sales & CRM, Procurement, Inventory and Projects are on; Support is
off.

---

## 6. Backend architecture (the important part)

The ERP side is built on a **driver / connector pattern** so the app never hard-
codes ERPNext. Adding SAP or Oracle later = one new connector class + one registry
line, with **zero changes** to routes, the frontend, or main.py.

```
Frontend
   │  /api/connect, /api/session/{id}/{module}/{resource}, /api/erp/chat
   ▼
routes/erp.py  ── generic, ERP-agnostic HTTP layer
   │  resolves session → connector
   ▼
connector_registry.get_connector("erpnext", credentials)
   ▼
connectors/erpnext.py  (ERPNextConnector : BaseConnector)
   │  CAPABILITIES map → report_* handlers → live ERPNext REST calls
   ▼
ERPNext / Frappe Cloud   (Authorization: token key:secret)
```

**Key pieces:**
- **`connectors/base.py`** — `BaseConnector` interface: `erp_type`,
  `CAPABILITIES` map, `get_report(module, resource, params)` dispatch.
- **`connectors/erpnext.py`** — the ERPNext driver. A **19-entry capability map**
  across accounting, sales, purchase, procurement, inventory, projects, support,
  HR — each mapping a `(module, resource)` to a `report_*` handler that fetches
  the DocType, normalizes it, and returns `(rows, summary)`.
- **`connector_registry.py`** — `{"erpnext": ERPNextConnector}`; SAP/Oracle listed
  but disabled.
- **`session_store.py`** — in-memory, opaque ids, 8h TTL, never persisted.
- **`routes/erp.py`** — generic endpoints: `/api/connectors`, `/api/connect`,
  `/api/session/{id}/status`, `/api/session/{id}/capabilities`, and the universal
  data route `/api/session/{id}/{module}/{resource}` — the same URL shape for
  every ERP.

**Note:** ERPNext logic was deliberately **removed from `main.py`** during the
refactor — `main.py` is now ERP-agnostic and only mounts the generic router.

---

## 7. Capability map (what the connector can fetch)

| Module | Resources |
|---|---|
| accounting | sales-invoices, purchase-invoices, payments, journal-entries |
| sales | orders, quotations, leads, opportunities |
| purchase | orders |
| procurement | suppliers |
| inventory | stock, items, delivery-notes, purchase-receipts |
| projects | list, tasks |
| support | issues |
| hr | employees, salary |

`GET /api/session/{id}/capabilities` returns the live list for the connected ERP.

---

## 8. Live behavior & data freshness

- Every module fetches **live** from ERPNext via session fetchers in
  `lib/erpnext-api.ts` (`fetchSession(path)` → the generic data route).
- **Year filter** narrows year-scoped reports (invoices, orders); current-state
  reports (suppliers, tasks, leads, stock) are point-in-time regardless of year.
- New records added in ERPNext appear in the dashboard on next fetch — confirmed
  during testing (data added in ERPNext showed up in the project).

---

## 9. Known state / gaps (as of this session)

- **Verified live data:** Leads 20, Opportunities 15, Sales Orders 45,
  Quotations 20, Suppliers 46, Purchase Orders 25, Stock 16, Delivery Notes 15,
  Purchase Receipts 15, Tasks 20, Sales Invoices present (₹88.3L for 2025).
- **Empty unless populated in ERPNext:** Projects and Issues were 0 — they render
  the empty state until records are added on the ERPNext side.
- **Lead `source` field** is restricted by ERPNext permissions, so Leads group by
  `territory` instead (a deliberate workaround).
- Sidebar nav items (Financial, Customers, etc.) are not yet wired to routes —
  the dashboard is single-page.

---

## 10. Security

- Credentials entered in the UI are held **only in backend memory** (8h TTL) —
  never written to a database, file, or log.
- The browser stores only the opaque `session_id`; it never holds the API
  key/secret.
- All ERPNext REST calls happen **server-side** with `Authorization: token
  key:secret`; the browser never talks to ERPNext directly.
- Disconnect drops the session (and any cached snapshot) immediately.

---

*Report covers the live ERPNext dashboard surface and its backend driver
architecture. Supabase/historical side excluded by request.*
