# backend/routes/erp.py
"""
Generic, ERP-agnostic API surface.

These routes know nothing about ERPNext (or SAP/Oracle). They resolve a
connector from the session's stored credentials and dispatch through the
common BaseConnector interface, so adding a new ERP requires zero changes
here — only a new driver class + a registry entry.
"""

from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from ai import erp_ai, docs_rag, intent_router
from connectors.registry import get_connector, list_supported_erps
from core.session_store import session_store

router = APIRouter()


class ConnectRequest(BaseModel):
    erp_type: str        # "erpnext" | "sap" | "oracle"
    credentials: dict    # shape depends on the ERP (see /api/connectors)


class ErpChatRequest(BaseModel):
    session_id: str
    question: str
    year: Optional[int] = None


@router.get("/api/connectors")
def list_connectors():
    """List supported ERP systems + the credential fields each one needs."""
    return list_supported_erps()


@router.post("/api/connect")
def connect_erp(request: ConnectRequest):
    """Validate credentials against the chosen ERP; on success open a session."""
    try:
        connector = get_connector(request.erp_type, request.credentials)
    except ValueError as e:
        return {"success": False, "error": str(e)}

    status = connector.test_connection()
    if status.get("status") != "online":
        return {"success": False, "error": status.get("error", "Connection failed")}

    session_id = session_store.create_session(request.erp_type, request.credentials)
    return {
        "success": True,
        "session_id": session_id,
        "user": status.get("user"),
        "erp_type": request.erp_type,
        "expires_in": session_store.ttl,
    }


@router.delete("/api/connect/{session_id}")
def disconnect_erp(session_id: str):
    """Drop a session and its in-memory credentials."""
    session_store.delete_session(session_id)
    erp_ai.invalidate(session_id)
    return {"success": True}


@router.post("/api/erp/chat")
def erp_chat(request: ErpChatRequest):
    """
    ERP-mode AI assistant. Classifies the question first:

      - "help" → ERPNext documentation RAG (how-to / conceptual). Does NOT need
                 a live ERP connection — concept questions work even if the
                 session is gone.
      - "data" → grounds a local Ollama model on the live ERP snapshot and
                 returns a plain-English answer (existing behavior, unchanged).
    """
    # Help (conceptual) questions: answer from the docs KB, regardless of session.
    if intent_router.classify_intent(request.question) == "help":
        try:
            result = docs_rag.answer(request.question)
            return {
                "answer": result["answer"],
                "model": result["model"],
                "intent": "help",
                "sources": result.get("sources", []),
                "data": None,
            }
        except Exception as e:
            print(f"Docs RAG error: {e}")
            return {
                "answer": (
                    "I couldn't reach the help service. Make sure Ollama is "
                    "running and the embedding model is installed "
                    "(`ollama pull nomic-embed-text`)."
                ),
                "intent": "help",
                "sources": [],
                "error": str(e),
                "data": None,
            }

    # Data questions: existing live-ERP flow, unchanged.
    connector, erp_type = _resolve(request.session_id)
    if not connector:
        return {
            "answer": "Your ERP session has expired. Please reconnect to keep chatting.",
            "session_expired": True,
            "data": None,
        }
    try:
        result = erp_ai.answer(
            connector,
            request.question,
            request.year,
            session_id=request.session_id,
            erp_type=erp_type or "erpnext",
        )
        return {"answer": result["answer"], "model": result["model"],
                "intent": "data", "data": None}
    except Exception as e:
        print(f"ERP chat error: {e}")
        return {
            "answer": (
                "I couldn't reach the AI service. Make sure Ollama is running "
                "locally (run `ollama serve`) and the model is installed "
                "(`ollama pull llama3.1:8b`)."
            ),
            "error": str(e),
            "data": None,
        }


@router.get("/api/session/{session_id}/status")
def session_status(session_id: str):
    """Return session info WITHOUT exposing the stored credentials."""
    session = session_store.get_session(session_id)
    if not session:
        return {"valid": False}
    return {
        "valid": True,
        "erp_type": session["erp_type"],
        "connected_at": session["created_at"],
        "last_used": session["last_used"],
    }


@router.get("/api/session/{session_id}/capabilities")
def session_capabilities(session_id: str):
    """List the (module, resource) reports the connected ERP supports."""
    connector, _ = _resolve(session_id)
    if not connector:
        return {"capabilities": [], "source": "session_expired"}
    return {"capabilities": connector.capabilities(), "source": connector.erp_type}


@router.get("/api/session/{session_id}/{module}/{resource}")
def session_report(session_id: str, module: str, resource: str,
                   year: Optional[int] = None):
    """
    Generic data endpoint. Resolves the session's connector and asks it for
    the {module}/{resource} report. Same URL shape for every ERP.
    """
    connector, _ = _resolve(session_id)
    if not connector:
        return {"data": [], "summary": {}, "source": "session_expired"}
    return connector.get_report(module, resource, {"year": year})


# ── helpers ──────────────────────────────────────────────────────────
def _resolve(session_id: str):
    """(connector, erp_type) from a session, or (None, None)."""
    session = session_store.get_session(session_id)
    if not session:
        return None, None
    try:
        connector = get_connector(session["erp_type"], session["credentials"])
    except ValueError:
        return None, None
    return connector, session["erp_type"]