# backend/session_store.py
"""
In-memory credential session store.

Credentials entered through the UI are held ONLY here, in process memory,
keyed by an opaque session_id. They are never written to a database, a
file, or a log. Sessions expire after a TTL (default 8 hours), after which
the credentials are dropped and the user must reconnect.
"""

import time
import secrets
from typing import Optional


class SessionStore:
    """
    session_id -> {erp_type, credentials, created_at, last_used}
    TTL: 8 hours. Credentials never written to disk or DB.
    """

    def __init__(self, ttl_seconds: int = 28800):  # 8 hours
        self._store: dict = {}
        self.ttl = ttl_seconds

    def create_session(self, erp_type: str, credentials: dict) -> str:
        """Create a new session and return its secure id."""
        self.cleanup_expired()
        session_id = secrets.token_urlsafe(32)
        now = time.time()
        self._store[session_id] = {
            "erp_type": erp_type,
            "credentials": credentials,
            "created_at": now,
            "last_used": now,
        }
        return session_id

    def get_session(self, session_id: str) -> Optional[dict]:
        """Return the session if it exists and is not expired, else None."""
        if not session_id:
            return None
        session = self._store.get(session_id)
        if not session:
            return None

        now = time.time()
        if now - session["created_at"] > self.ttl:
            # expired — drop it
            self._store.pop(session_id, None)
            return None

        session["last_used"] = now
        return session

    def delete_session(self, session_id: str) -> None:
        """Remove a session (no error if it doesn't exist)."""
        self._store.pop(session_id, None)

    def cleanup_expired(self) -> None:
        """Remove all sessions past their TTL."""
        now = time.time()
        expired = [
            sid for sid, s in self._store.items()
            if now - s["created_at"] > self.ttl
        ]
        for sid in expired:
            self._store.pop(sid, None)


# Singleton instance used across the app
session_store = SessionStore()