# backend/intent_router.py
"""
Intent classification for the AI chat (step 1 of the RAG-based help system).

Classifies a user's question as:
  - "data" : a request for figures from the ERP / Supabase database. This routes
             to the EXISTING chat flow, unchanged.
  - "help" : a how-to / troubleshooting / conceptual question. For now this just
             returns a placeholder {"intent": "help", "query": question}; the RAG
             help backend will be wired in a later task.

This module is intentionally self-contained — it imports nothing from the rest of
the app and is not yet called by any endpoint, so existing chat behavior is
completely unaffected until it is explicitly wired in.

Classification is simple keyword matching for now (no ML), with two tiers so it
stays accurate even when help and data words collide:

  STRONG help phrases — procedural / conceptual / troubleshooting wording like
  "how do i", "how to", "explain", "configure", "difference between". These are
  unmistakably help even when ERP nouns appear, so they WIN over data keywords:
  "how do i create a sales invoice" → help (not data, despite 'sales'/'invoice').

  WEAK help phrases — ambiguous wording like "what is", which can begin a data
  question ("what is my total revenue"). These map to help ONLY when no data
  keyword is present, protecting the existing data path.
"""

import re
from typing import Optional

# Unmistakable how-to / conceptual / troubleshooting phrasing → always help.
STRONG_HELP_KEYWORDS = [
    "how to",
    "how do i",
    "how can i",
    "how does",
    "explain",
    "guide",
    "configure",
    "configuration",
    "setup",
    "set up",
    "difference between",
    "where is",
    "where do i",
    "error",
    "problem",
    "can't",
    "cant",
    "cannot",
    "unable",
    "failed",
]

# Ambiguous help phrasing → help only if no data keyword is present.
WEAK_HELP_KEYWORDS = [
    "what is",
    "what are",
    "issue",   # "I have an issue" (help) vs "how many issues" (data)
]

# Words that indicate the user wants figures from the database → existing chat.
DATA_KEYWORDS = [
    "number", "numbers", "show", "total", "count", "revenue", "invoice",
    "invoices", "order", "orders", "stock", "lead", "leads", "outstanding",
    "receivable", "receivables", "payable", "payables", "supplier", "suppliers",
    "task", "tasks", "project", "projects", "sales", "purchase", "payment",
    "payments", "opportunity", "opportunities", "quotation", "quotations",
    "how many", "how much", "average", "sum",
]


def _normalize(text: str) -> str:
    """Lowercase and unify apostrophes so 'can't' / 'can’t' both match."""
    return (text or "").lower().replace("’", "'")


def _has_any(text: str, keywords: list) -> bool:
    """
    Whole-word/phrase match (boundary-aware) so a keyword can't hide inside a
    larger word — e.g. "how to" must NOT match inside "sho[w to]tal".
    """
    for kw in keywords:
        if re.search(r"(?<!\w)" + re.escape(kw) + r"(?!\w)", text):
            return True
    return False


def classify_intent(question: str) -> str:
    """
    Return "help" or "data". Default is "data" (the safe, existing behavior).

    1. A STRONG help phrase → "help", even if data nouns are also present.
    2. Otherwise a WEAK help phrase → "help" only if no data keyword is present.
    3. Everything else → "data".
    """
    text = _normalize(question)
    if not text:
        return "data"

    if _has_any(text, STRONG_HELP_KEYWORDS):
        return "help"

    if _has_any(text, WEAK_HELP_KEYWORDS) and not _has_any(text, DATA_KEYWORDS):
        return "help"

    return "data"


def route(question: str) -> Optional[dict]:
    """
    Routing helper for the chat endpoints.

    - "help" → returns the placeholder dict {"intent": "help", "query": question}.
               (Caller should return this directly to the client.)
    - "data" → returns None, signaling the caller to PROCEED with the existing
               ERP/Supabase chat flow unchanged.

    Intended usage when wired in later:

        routed = route(request.question)
        if routed:
            return routed              # help placeholder
        ...                            # existing data chat, untouched
    """
    if classify_intent(question) == "help":
        return {"intent": "help", "query": question}
    return None


if __name__ == "__main__":
    # Quick manual sanity check.
    samples = [
        "What's my total outstanding receivables?",   # data
        "How many invoices are unpaid?",              # data
        "How do I create a Sales Invoice?",           # help (strong wins over 'sales/invoice')
        "How do I connect my ERP?",                   # help
        "what is the difference between leads and opportunities",  # help (strong: difference between)
        "Explain how the year filter works",          # help
        "show total revenue for 2025",                # data
        "configure ollama model",                     # help
        "what is my revenue this year",               # data (weak 'what is' + data kw)
    ]
    for q in samples:
        print(f"{classify_intent(q):>5}  |  {q}")
