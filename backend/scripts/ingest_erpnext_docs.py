"""
Ingest the scraped ERPNext / Frappe HR documentation into a DEDICATED Chroma
collection ("erpnext_docs"), kept separate from the Vanna text-to-SQL collection
("sigzen_bi") so conceptual docs never pollute SQL generation.

Embeddings: Ollama `nomic-embed-text` (same Ollama host the chat uses). We supply
vectors to Chroma explicitly, so the collection has no default embedder — query
time MUST use the same model (see docs_rag.py).

Run from the backend/ folder (so ./chroma_db resolves to backend/chroma_db):
    cd backend
    ollama pull nomic-embed-text          # one-time
    python scripts/ingest_erpnext_docs.py

Re-running is idempotent: the collection is dropped and rebuilt.
"""
import os
import re

import chromadb
import ollama

# This script lives in backend/scripts/, so the repo's data/ folder is two
# levels up: backend/scripts/ -> backend/ -> repo root -> data/erpnext_docs.
DOCS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "erpnext_docs")
CHROMA_PATH = "./chroma_db"          # same store Vanna uses
COLLECTION = "erpnext_docs"          # separate collection (NOT sigzen_bi)

EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

FM_RE = re.compile(r'^---\n(.*?)\n---\n?(.*)$', re.DOTALL)
MAX_CHARS = 1500                     # ~chunk size
OVERLAP = 200

_client = ollama.Client(host=OLLAMA_HOST)


def embed(text: str):
    """Embed one string with the Ollama embedding model."""
    resp = _client.embeddings(model=EMBED_MODEL, prompt=text)
    return resp["embedding"]


def parse_doc(text):
    m = FM_RE.match(text)
    if not m:
        return {}, text.strip()
    fm_raw, body = m.group(1), m.group(2).strip()
    meta = {}
    for line in fm_raw.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, body


def module_from_path(rel: str):
    """
    Derive (module, submodule) from the folder path — more reliable than
    frontmatter, which is missing `module` on some docs.
      "Support/foo.md"                  -> ("Support", "")
      "HR/Leave_Management/bar.md"      -> ("HR", "Leave_Management")
    """
    parts = rel.split("/")
    module = parts[0] if len(parts) >= 2 else ""
    submodule = parts[1] if len(parts) >= 3 else ""
    return module, submodule


def chunk(body):
    """Split on blank lines, packing paragraphs up to MAX_CHARS with light overlap."""
    paras = [p.strip() for p in re.split(r'\n\s*\n', body) if p.strip()]
    chunks, cur = [], ""
    for p in paras:
        if len(cur) + len(p) + 2 <= MAX_CHARS:
            cur = f"{cur}\n\n{p}" if cur else p
        else:
            if cur:
                chunks.append(cur)
            cur = (cur[-OVERLAP:] + "\n\n" + p) if cur else p
            if len(cur) > MAX_CHARS:           # single huge paragraph
                for i in range(0, len(cur), MAX_CHARS - OVERLAP):
                    chunks.append(cur[i:i + MAX_CHARS])
                cur = ""
    if cur:
        chunks.append(cur)
    return chunks


def main():
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    try:
        client.delete_collection(COLLECTION)
    except Exception:
        pass
    # No embedding_function: we pass vectors explicitly (Ollama nomic-embed-text).
    col = client.create_collection(COLLECTION)

    ids, docs, metas = [], [], []
    n_files = 0
    for root, _, files in os.walk(DOCS_DIR):
        for fn in files:
            if not fn.endswith(".md"):
                continue
            path = os.path.join(root, fn)
            with open(path, encoding="utf-8") as f:
                meta, body = parse_doc(f.read())
            if len(body) < 100:
                continue
            n_files += 1
            rel = os.path.relpath(path, DOCS_DIR).replace(os.sep, "/")
            module, submodule = module_from_path(rel)
            for i, ch in enumerate(chunk(body)):
                ids.append(f"{rel}#{i}")
                docs.append(ch)
                metas.append({
                    "title": meta.get("title", ""),
                    "url": meta.get("url", ""),
                    # path-derived module is authoritative; fall back to frontmatter
                    "module": module or meta.get("module", ""),
                    "submodule": submodule or meta.get("submodule", ""),
                    "source_file": rel,
                })

    print(f"Embedding {len(ids)} chunks from {n_files} docs with '{EMBED_MODEL}'...")
    embeddings = []
    for i, d in enumerate(docs):
        embeddings.append(embed(d))
        if (i + 1) % 200 == 0:
            print(f"  embedded {i + 1}/{len(docs)}")

    # Chroma batches: add in chunks to stay under limits
    B = 200
    for i in range(0, len(ids), B):
        col.add(
            ids=ids[i:i + B],
            documents=docs[i:i + B],
            metadatas=metas[i:i + B],
            embeddings=embeddings[i:i + B],
        )

    print(f"Ingested {n_files} docs -> {len(ids)} chunks into collection '{COLLECTION}'")
    print(f"Chroma path: {os.path.abspath(CHROMA_PATH)}  embed model: {EMBED_MODEL}")


if __name__ == "__main__":
    main()
