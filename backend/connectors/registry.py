# backend/connectors/registry.py
"""
Connector Registry — the middleware "driver manager".

Maps an ERP type string to its connector class so the rest of the app
never has to know about concrete connector implementations. Adding a new
ERP (SAP, Oracle, ...) later means: write one connector class and add a
single entry to CONNECTOR_REGISTRY + one entry to SUPPORTED_ERPS.
"""

from connectors.erpnext import ERPNextConnector

# Registry maps ERP type string to connector class.
CONNECTOR_REGISTRY = {
    "erpnext": ERPNextConnector,
    # "sap": SAPConnector,       # future
    # "oracle": OracleConnector, # future
}

# UI-facing metadata: what ERPs are supported and which credential fields
# each one needs. The frontend renders its credential form dynamically from
# this — nothing about field names is hardcoded on the client.
SUPPORTED_ERPS = [
    {
        "id": "erpnext",
        "name": "ERPNext / Frappe",
        "logo": "erpnext",
        "enabled": True,
        "credential_fields": [
            {
                "key": "url",
                "label": "ERPNext URL",
                "placeholder": "https://yoursite.frappe.cloud",
                "type": "url",
            },
            {
                "key": "api_key",
                "label": "API Key",
                "placeholder": "your_api_key",
                "type": "text",
            },
            {
                "key": "api_secret",
                "label": "API Secret",
                "placeholder": "your_api_secret",
                "type": "password",
            },
        ],
    },
    {
        "id": "sap",
        "name": "SAP",
        "logo": "sap",
        "enabled": False,  # coming soon
        "credential_fields": [],
    },
    {
        "id": "oracle",
        "name": "Oracle ERP",
        "logo": "oracle",
        "enabled": False,  # coming soon
        "credential_fields": [],
    },
]


def get_connector(erp_type: str, credentials: dict):
    """
    Factory function — instantiate the correct connector for an ERP type.

    erp_type:    "erpnext" | "sap" | "oracle"
    credentials: dict with the keys that connector needs
                 (for erpnext: url, api_key, api_secret)

    Returns an initialized connector instance.
    Raises ValueError if the ERP type is not supported.
    """
    key = (erp_type or "").strip().lower()
    connector_cls = CONNECTOR_REGISTRY.get(key)
    if connector_cls is None:
        supported = ", ".join(sorted(CONNECTOR_REGISTRY.keys()))
        raise ValueError(
            f"Unsupported ERP type '{erp_type}'. Supported: {supported}"
        )
    return connector_cls(credentials=credentials)


def list_supported_erps() -> list:
    """Return the list of supported ERP types with their UI metadata."""
    return SUPPORTED_ERPS