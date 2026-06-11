# backend/connectors/base.py
"""
BaseConnector — the common interface every ERP driver implements.

The rest of the app (routes, main) only ever talks to a connector through
this interface, so it never needs to know which ERP it is. Adding a new ERP
means subclassing this and filling in:
  - erp_type            : the registry key ("erpnext", "sap", ...)
  - test_connection()   : auth/health check -> {"status": "online"|"offline", ...}
  - CAPABILITIES        : {(module, resource): "handler_method_name"}
  - the handler methods : (params: dict) -> (data: list, summary: dict)

`get_report(module, resource, params)` dispatches to the right handler, so
the HTTP layer stays generic: /api/session/{id}/{module}/{resource}.
"""

from typing import Optional, Tuple


class BaseConnector:
    # Registry key — overridden by each driver.
    erp_type: str = "base"

    # Maps a (module, resource) capability to a handler method name on the
    # subclass. Each handler takes a params dict and returns (data, summary).
    CAPABILITIES: dict = {}

    def __init__(self, credentials: Optional[dict] = None):
        self.credentials = credentials

    # ── must be implemented by each driver ──────────────────────────
    def test_connection(self) -> dict:
        raise NotImplementedError

    # ── generic dispatch (shared by all drivers) ────────────────────
    def get_report(self, module: str, resource: str,
                   params: Optional[dict] = None) -> dict:
        """Resolve a capability to its handler and return a uniform payload."""
        params = params or {}
        handler_name = self.CAPABILITIES.get((module, resource))
        if not handler_name:
            return {
                "data": [],
                "summary": {},
                "source": self.erp_type,
                "error": f"Unsupported capability: {module}/{resource}",
            }
        handler = getattr(self, handler_name)
        data, summary = handler(params)
        return {"data": data, "summary": summary, "source": self.erp_type}

    @classmethod
    def capabilities(cls) -> list:
        """List the (module, resource) pairs this driver supports."""
        return [{"module": m, "resource": r} for (m, r) in cls.CAPABILITIES]

    # convenience for handlers
    @staticmethod
    def _f(value) -> float:
        try:
            return float(value or 0)
        except (TypeError, ValueError):
            return 0.0
