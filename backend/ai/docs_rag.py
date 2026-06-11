# backend/docs_rag.py
"""
ERPNext documentation RAG (the "help" path of the chat).

For conceptual / how-to questions ("how do I configure an Assignment Rule?",
"what is a Delivery Note?") we retrieve from the dedicated `erpnext_docs` Chroma
collection (built by ingest_erpnext_docs.py) and let llama3.1:8b answer ONLY from
those excerpts, with source links for citation.

This is completely separate from:
  - Vanna text-to-SQL (Supabase, collection `sigzen_bi`), and
  - erp_ai.py (live ERP data answers).

Embeddings use the same Ollama model the docs were ingested with
(`nomic-embed-text`) — query and index MUST match.
"""

import os

import chromadb
import ollama

CHROMA_PATH = "./chroma_db"
COLLECTION = "erpnext_docs"

EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
TOP_K = 5


def _model() -> str:
    return os.getenv("OLLAMA_CHAT_MODEL", "llama3.1:8b")


def _host() -> str:
    return os.getenv("OLLAMA_HOST", "http://localhost:11434")


# Lazily-opened Chroma collection (None until first use / if not ingested yet).
_collection = None


def _get_collection():
    global _collection
    if _collection is not None:
        return _collection
    try:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        _collection = client.get_collection(COLLECTION)
    except Exception:
        _collection = None
    return _collection


def _embed(client, text: str):
    return client.embeddings(model=EMBED_MODEL, prompt=text)["embedding"]


def retrieve(question: str, k: int = TOP_K):
    """Return (chunks, sources) for the question, or ([], []) if unavailable."""
    col = _get_collection()
    if col is None:
        return [], []

    client = ollama.Client(host=_host())
    qvec = _embed(client, question)
    res = col.query(
        query_embeddings=[qvec],
        n_results=k,
        include=["documents", "metadatas"],
    )
    docs = (res.get("documents") or [[]])[0]
    metas = (res.get("metadatas") or [[]])[0]

    chunks = []
    sources = []
    seen = set()
    for doc, meta in zip(docs, metas):
        meta = meta or {}
        chunks.append({
            "text": doc,
            "title": meta.get("title", ""),
            "url": meta.get("url", ""),
            "module": meta.get("module", ""),
        })
        url = meta.get("url", "")
        key = url or meta.get("title", "")
        if key and key not in seen:
            seen.add(key)
            sources.append({"title": meta.get("title", ""), "url": url,
                            "module": meta.get("module", "")})
    return chunks, sources


def _build_messages(question: str, chunks: list):
    context = "\n\n".join(
        f"[Source {i + 1}] {c['title']} ({c['url']})\n{c['text']}"
        for i, c in enumerate(chunks)
    )
    system = (
        "You are the ERPNext help assistant for a business-intelligence "
        "dashboard. You answer how-to, conceptual and troubleshooting questions "
        "about ERPNext using ONLY the documentation excerpts provided. Rules:\n"
        "1. Answer strictly from the excerpts. Do not invent steps or features.\n"
        "2. If the excerpts don't cover the question, say so plainly and suggest "
        "what to search for instead.\n"
        "3. Be concise and practical. Use short numbered steps for how-to "
        "answers.\n"
        "4. Do NOT answer questions about the user's own live data or numbers — "
        "this path is for understanding how ERPNext works, not their figures."
    )
    user = (
        f"Documentation excerpts:\n{context}\n\n"
        f"Question: {question}\n\n"
        "Answer using only the excerpts above."
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def answer(question: str) -> dict:
    """
    Answer a help question from the ERPNext docs.

    Returns {answer, sources, model}. Never raises for the "not ingested" or
    "no match" cases — it returns a helpful message instead. May raise on Ollama
    transport errors so the route can show the "is Ollama running?" message.
    """
    chunks, sources = retrieve(question)

    if _get_collection() is None:
        return {
            "answer": (
                "The ERPNext help knowledge base isn't built yet. Run "
                "`python ingest_erpnext_docs.py` in the backend to enable "
                "help answers."
            ),
            "sources": [],
            "model": _model(),
        }

    if not chunks:
        return {
            "answer": (
                "I couldn't find anything in the ERPNext documentation for that. "
                "Try rephrasing, or ask about a specific ERPNext feature "
                "(e.g. \"how do I set up an Assignment Rule?\")."
            ),
            "sources": [],
            "model": _model(),
        }

    messages = _build_messages(question, chunks)
    client = ollama.Client(host=_host())
    resp = client.chat(
        model=_model(),
        messages=messages,
        options={"temperature": 0.2},
        keep_alive="30m",
    )
    text = (resp.get("message") or {}).get("content", "").strip()
    return {
        "answer": text or "I wasn't able to generate an answer. Please try rephrasing.",
        "sources": sources,
        "model": _model(),
    }
