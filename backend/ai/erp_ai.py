# backend/erp_ai.py
"""
ERP-mode AI assistant (context-grounded).

Unlike the Supabase assistant (Vanna text-to-SQL), the ERP assistant does NOT
write or run SQL. ERP data arrives as REST report summaries, so this module:

  1. gathers the connected session's module summaries (sales, procurement,
     inventory, projects, support) — the same numbers shown on the dashboard,
  2. caches that snapshot per-session for a short TTL so repeated questions
     don't re-hit the (slow) ERP,
  3. feeds those pre-computed figures as FACTS to a local Ollama general model
     (llama3.1:8b), which only phrases the answer.

Pre-computing the numbers is deliberate: small local models are unreliable at
arithmetic, so we never ask the model to calculate — only to narrate facts the
connector already computed.
"""

import os
import re
import time
import json

import ollama

# (module, resource, friendly label) reports pulled into the ERP chat context.
# Kept small and high-signal so the prompt stays compact and the snapshot fast.
CONTEXT_REPORTS = [
    ("accounting", "sales-invoices", "Sales Invoices"),
    ("accounting", "purchase-invoices", "Purchase Invoices"),
    ("accounting", "payments", "Payments"),
    ("sales", "orders", "Sales Orders"),
    ("sales", "leads", "Leads"),
    ("sales", "opportunities", "Opportunities"),
    ("purchase", "orders", "Purchase Orders"),
    ("procurement", "suppliers", "Suppliers"),
    ("inventory", "stock", "Stock"),
    ("inventory", "delivery-notes", "Delivery Notes"),
    ("inventory", "purchase-receipts", "Purchase Receipts"),
    ("projects", "list", "Projects"),
    ("projects", "tasks", "Tasks"),
    ("support", "issues", "Issues"),
]

_CACHE_TTL = 90  # seconds — short, so chat reflects near-live ERP state
# session_id -> {"ts": float, "year": int|None, "context": dict}
_context_cache: dict = {}


def _model() -> str:
    return os.getenv("OLLAMA_CHAT_MODEL", "llama3.1:8b")


def _host() -> str:
    return os.getenv("OLLAMA_HOST", "http://localhost:11434")


def gather_context(connector, year=None, *, session_id=None, force=False) -> dict:
    """
    Build (or reuse a cached) snapshot of the connected ERP's module summaries.

    Returns {label: summary_dict, ...}. Only the small `summary` payloads are
    kept (not raw rows), so the prompt stays compact. A failing report is
    skipped rather than failing the whole snapshot.
    """
    if session_id and not force:
        cached = _context_cache.get(session_id)
        if (cached and cached["year"] == year
                and (time.time() - cached["ts"]) < _CACHE_TTL):
            return cached["context"]

    context = {}
    for module, resource, label in CONTEXT_REPORTS:
        try:
            report = connector.get_report(module, resource, {"year": year})
            summary = report.get("summary") or {}
            if summary:
                context[label] = summary
        except Exception:
            # one failing report shouldn't break the whole snapshot
            continue

    if session_id:
        _context_cache[session_id] = {
            "ts": time.time(), "year": year, "context": context,
        }
    return context


def invalidate(session_id: str) -> None:
    """Drop a session's cached snapshot (called on disconnect)."""
    _context_cache.pop(session_id, None)


def _fmt_inr(value) -> str:
    """
    Pre-format a number as Indian currency so the MODEL never has to convert.

    Small models fumble Lakh/Crore math (₹88.3L became "8.83 Lakh" — off 10x).
    We hand it a ready string to quote verbatim.
    """
    try:
        n = float(value)
    except (TypeError, ValueError):
        return "₹0"
    if abs(n) >= 1e7:
        return f"₹{n / 1e7:.2f} Cr"
    if abs(n) >= 1e5:
        return f"₹{n / 1e5:.2f} Lakh"
    return f"₹{n:,.0f}"


def _extract_year(question: str):
    """Return a 4-digit year mentioned in the question (last one wins), else None."""
    years = re.findall(r"\b(20\d{2})\b", question or "")
    return int(years[-1]) if years else None


def _headline(context: dict, year=None) -> dict:
    """
    Extract the most-asked metrics under UNAMBIGUOUS names.

    Small models otherwise mismatch lookalike fields (e.g. "receivables" ->
    "received" = 0). Money is pre-formatted to INR strings so the model only
    quotes it. Only present figures are kept.
    """
    def s(label):
        return context.get(label) or {}

    raw = {}
    # year stamp so the model always knows which period it's describing
    if year is not None:
        raw["snapshot_year"] = year

    si = s("Sales Invoices")
    if si:
        raw["total_invoiced"] = _fmt_inr(si.get("total_value"))
        raw["outstanding_receivables"] = _fmt_inr(si.get("outstanding_value"))   # customers owe us
        raw["collected_from_customers"] = _fmt_inr(si.get("collected_value"))
        raw["sales_invoice_count"] = si.get("total_count")
        raw["overdue_invoice_count"] = si.get("overdue_count")
    pi = s("Purchase Invoices")
    if pi:
        raw["total_purchase_bills"] = _fmt_inr(pi.get("total_value"))
        raw["outstanding_payables"] = _fmt_inr(pi.get("outstanding_value"))      # we owe suppliers
    sup = s("Suppliers")
    if sup:
        raw["total_suppliers"] = sup.get("total_count")
        raw["active_suppliers"] = sup.get("active_count")
    ld = s("Leads")
    if ld:
        raw["total_leads"] = ld.get("total_count")
    op = s("Opportunities")
    if op:
        raw["total_opportunities"] = op.get("total_count")
    tk = s("Tasks")
    if tk:
        raw["total_tasks"] = tk.get("total_count")
        raw["open_tasks"] = tk.get("open_count")
        raw["completed_tasks"] = tk.get("completed_count")
    pr = s("Projects")
    if pr:
        raw["total_projects"] = pr.get("total_count")
        raw["open_projects"] = pr.get("open_count")
    iss = s("Issues")
    if iss:
        raw["total_support_issues"] = iss.get("total_count")
        raw["open_support_issues"] = iss.get("open_count")

    # drop missing figures so the model never sees a misleading null
    return {k: v for k, v in raw.items() if v is not None}


def _build_messages(context: dict, question: str, year, erp_type: str):
    payload = {
        "KEY_FIGURES": _headline(context, year),   # prefer these for common questions
        "MODULE_DETAILS": context,                 # full per-module summaries
    }
    facts = json.dumps(payload, indent=2, default=str)
    year_line = (
        f"This snapshot is for the YEAR {year}. It reflects only that year's data."
        if year else
        "This snapshot reflects current ERP data."
    )
    system = (
        "You are the ERP assistant for a business-intelligence dashboard. "
        f"You answer questions about the user's live {erp_type} data. "
        f"{year_line} "
        "You are given a JSON snapshot of PRE-COMPUTED figures (totals, counts, "
        "status breakdowns). Follow these rules strictly:\n"
        "1. Answer ONLY from the figures in the snapshot.\n"
        "2. Prefer the KEY_FIGURES block for common questions; fall back to "
        "MODULE_DETAILS for anything more specific.\n"
        "3. Never invent numbers and never do your own arithmetic — every "
        "number you need is already computed.\n"
        "4. MONEY IS ALREADY FORMATTED in KEY_FIGURES (e.g. '₹88.30 Lakh'). "
        "Quote those strings EXACTLY. Never recompute Lakh/Crore yourself.\n"
        "5. The snapshot is for the year stated above. If the user asks about "
        "that same year, answer directly — the figures already match it. If the "
        "user asks about a DIFFERENT year than the snapshot, say which year this "
        "snapshot covers and that you can only show one year at a time.\n"
        "6. If the snapshot does not contain the answer, say so plainly and "
        "suggest what the user could look at instead.\n"
        "7. Be concise and conversational. Lead with the figure that answers "
        "the question.\n\n"
        "GLOSSARY (map the user's words to the right figure):\n"
        "- 'receivables' / 'outstanding receivables' / 'money customers owe' = "
        "KEY_FIGURES.outstanding_receivables. Do NOT confuse 'receivables' with "
        "'received'.\n"
        "- 'payables' / 'money we owe suppliers' = outstanding_payables.\n"
        "- 'collected' / 'received from customers' = collected_from_customers.\n"
        "- 'invoiced' / 'billed' / 'total sales billed' = total_invoiced."
    )
    user = (
        f"Live ERP snapshot (year {year}):\n" if year else "Live ERP snapshot:\n"
    ) + f"```json\n{facts}\n```\n\nQuestion: {question}"
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def answer(connector, question: str, year=None, *,
           session_id=None, erp_type="erpnext") -> dict:
    """
    Produce a plain-English answer to `question` grounded on the ERP snapshot.

    Returns {answer, model, year}. A year named in the question (e.g. "...for
    2025") overrides the dashboard's selected year, so the user can pull any
    year without changing the filter. Raises on Ollama transport errors so the
    route can convert them into a friendly "is Ollama running?" message.
    """
    # A year mentioned in the question wins over the dashboard's selected year.
    effective_year = _extract_year(question) or year

    context = gather_context(connector, effective_year, session_id=session_id)
    if not context:
        return {
            "answer": (
                "I couldn't read any data from your ERP right now. The "
                "connection may have dropped, or there's no data for "
                f"{effective_year or 'the selected year'}. Try reconnecting "
                "or asking about a different year."
            ),
            "model": _model(),
            "year": effective_year,
        }

    messages = _build_messages(context, question, effective_year, erp_type)
    client = ollama.Client(host=_host())
    resp = client.chat(
        model=_model(),
        messages=messages,
        options={"temperature": 0.2},
        keep_alive="30m",   # stay loaded so follow-up questions don't reload
    )
    text = (resp.get("message") or {}).get("content", "").strip()
    return {
        "answer": text or "I wasn't able to generate an answer. Please try rephrasing.",
        "model": _model(),
        "year": effective_year,
    }
