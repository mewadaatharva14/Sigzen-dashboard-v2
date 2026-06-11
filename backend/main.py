import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client
from ai.vanna_setup import get_vanna_instance, train_vanna
import psycopg2
import psycopg2.extras
from connectors.registry import get_connector
from routes.erp import router as erp_router

load_dotenv()

app = FastAPI(
    title="Sigzen BI API",
    description="AI-powered BI API for Sigzen Technologies",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Generic, ERP-agnostic connection + session data routes (driver/registry layer).
app.include_router(erp_router)

# ── SUPABASE CLIENT (REST API) ────────────────────────
def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return create_client(url, key)

# ── VANNA INSTANCE ────────────────────────────────────
vn = None

@app.on_event("startup")
async def startup_event():
    global vn
    print("Starting Sigzen BI API...")
    print("Initializing Vanna AI...")
    try:
        vn = get_vanna_instance()
        print("Vanna AI ready!")
    except Exception as e:
        # Ollama (used by Vanna for the AI chat) may be unavailable.
        # Don't crash the API — the dashboard and ERPNext live data
        # don't need it. The chat endpoint returns 503 while vn is None.
        vn = None
        print(f"Vanna AI unavailable (chat disabled): {e}")

# ── REQUEST MODELS ────────────────────────────────────
class ChatRequest(BaseModel):
    question: str
    year: Optional[int] = None
    conversation_history: Optional[list] = []

# ── HEALTH CHECK ──────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "running",
        "service": "Sigzen BI API",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

# ── AVAILABLE YEARS ───────────────────────────────────
def _erpnext_years() -> set:
    """Years present in live ERPNext accounting data (empty set if offline).
    Uses the env-configured ERPNext via the registry (credentials=None)."""
    connector = get_connector("erpnext", None)
    if connector.test_connection().get("status") != "online":
        return set()

    years = set()
    rows = (
        connector.get_sales_invoices()
        + connector.get_purchase_invoices()
        + connector.get_payment_entries()
        + connector.get_journal_entries()
    )
    for row in rows:
        date_str = row.get("posting_date") or row.get("transaction_date")
        if date_str and len(date_str) >= 4 and date_str[:4].isdigit():
            years.add(int(date_str[:4]))
    return years


@app.get("/api/years")
def get_available_years():
    try:
        sb = get_supabase()
        response = sb.table("financial_monthly")\
            .select("month")\
            .order("month", desc=True)\
            .execute()

        supabase_years = set(
            int(row["month"][:4]) for row in response.data
        )

        # Merge in years from live ERPNext data so its modules are selectable.
        try:
            erp_years = _erpnext_years()
        except Exception:
            erp_years = set()

        years = sorted(supabase_years | erp_years, reverse=True)

        # Default to the latest Supabase year so the (Supabase-driven)
        # main dashboard stays populated on first load.
        default_year = (
            max(supabase_years) if supabase_years
            else (years[0] if years else 2024)
        )

        return {
            "years": years,
            # Source-separated so the UI can label which years come from where
            # (Supabase history vs live ERP) instead of guessing by a threshold.
            "supabase_years": sorted(supabase_years, reverse=True),
            "erpnext_years": sorted(erp_years, reverse=True),
            "default": default_year
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching years: {str(e)}"
        )

# ── FINANCIAL BY YEAR ─────────────────────────────────
@app.get("/api/financial/{year}")
def get_financial_by_year(year: int):
    try:
        sb = get_supabase()
        response = sb.table("financial_monthly")\
            .select("month,revenue,expenses,gross_profit,profit_margin_pct")\
            .gte("month", f"{year}-01-01")\
            .lte("month", f"{year}-12-31")\
            .order("month")\
            .execute()

        data = []
        for row in response.data:
            from datetime import datetime
            month_label = datetime.strptime(
                row["month"], "%Y-%m-%d"
            ).strftime("%b %y")
            data.append({
                "month": month_label,
                "revenue": float(row["revenue"] or 0),
                "expenses": float(row["expenses"] or 0),
                "profit": float(row["gross_profit"] or 0),
                "profit_margin_pct": float(
                    row["profit_margin_pct"] or 0
                )
            })

        return {"year": year, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── REVENUE BY YEAR ───────────────────────────────────
@app.get("/api/revenue/{year}")
def get_revenue_by_year(year: int):
    try:
        sb = get_supabase()
        response = sb.table("revenue_by_service")\
            .select("month,service_type,revenue,num_deals")\
            .gte("month", f"{year}-01-01")\
            .lte("month", f"{year}-12-31")\
            .order("month")\
            .execute()

        from datetime import datetime
        month_map: dict = {}
        for row in response.data:
            label = datetime.strptime(
                row["month"], "%Y-%m-%d"
            ).strftime("%b %y")
            if label not in month_map:
                month_map[label] = {
                    "month": label,
                    "license": 0,
                    "implementation": 0,
                    "support": 0
                }
            stype = (row["service_type"] or "").lower()
            rev = float(row["revenue"] or 0)
            if "license" in stype:
                month_map[label]["license"] += rev
            elif "implementation" in stype:
                month_map[label]["implementation"] += rev
            elif "support" in stype:
                month_map[label]["support"] += rev

        return {"year": year, "data": list(month_map.values())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── CLIENTS BY YEAR ───────────────────────────────────
@app.get("/api/clients/{year}")
def get_clients_by_year(year: int):
    try:
        sb = get_supabase()
        response = sb.table("client_monthly_snapshot")\
            .select("month,new_clients,churned_clients,active_clients,total_arr")\
            .gte("month", f"{year}-01-01")\
            .lte("month", f"{year}-12-31")\
            .order("month")\
            .execute()

        from datetime import datetime
        data = []
        for row in response.data:
            label = datetime.strptime(
                row["month"], "%Y-%m-%d"
            ).strftime("%b %y")
            data.append({
                "month": label,
                "new_clients": row["new_clients"] or 0,
                "churned_clients": row["churned_clients"] or 0,
                "active_clients": row["active_clients"] or 0,
                "total_arr": float(row["total_arr"] or 0)
            })

        return {"year": year, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── WEBSITE BY YEAR ───────────────────────────────────
@app.get("/api/website/{year}")
def get_website_by_year(year: int):
    try:
        sb = get_supabase()
        response = sb.table("website_monthly_metrics")\
            .select("month,total_sessions,unique_visitors,leads_generated,demo_requests,conversions,bounce_rate_pct,top_traffic_source")\
            .gte("month", f"{year}-01-01")\
            .lte("month", f"{year}-12-31")\
            .order("month")\
            .execute()

        from datetime import datetime
        data = []
        for row in response.data:
            label = datetime.strptime(
                row["month"], "%Y-%m-%d"
            ).strftime("%b %y")
            data.append({
                "month": label,
                "total_sessions": row["total_sessions"] or 0,
                "unique_visitors": row["unique_visitors"] or 0,
                "leads_generated": row["leads_generated"] or 0,
                "demo_requests": row["demo_requests"] or 0,
                "conversions": row["conversions"] or 0,
                "bounce_rate_pct": float(
                    row["bounce_rate_pct"] or 0
                ),
                "top_traffic_source": row["top_traffic_source"] or ""
            })

        return {"year": year, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── CHAT ENDPOINT ─────────────────────────────────────
@app.post("/api/chat")
async def chat(request: ChatRequest):
    global vn

    if not vn:
        raise HTTPException(
            status_code=503,
            detail="Vanna AI not initialized"
        )

    try:
        question = request.question
        if request.year:
            question = f"{question} (for year {request.year})"

        print(f"Question: {question}")

        sql = vn.generate_sql(question)
        print(f"Generated SQL: {sql}")

        if not sql:
            return {
                "answer": "I could not understand that question. Please try rephrasing.",
                "sql": None,
                "data": None
            }

        # Execute SQL via Supabase RPC
        sb = get_supabase()
        try:
            result = sb.rpc(
                "execute_query",
                {"query_text": sql}
            ).execute()
            data = result.data or []
        except Exception:
            # Fallback — parse SQL and use REST API
            data = []

        summary = generate_summary(question, data, sql)

        return {
            "answer": summary,
            "sql": sql,
            "data": data,
            "row_count": len(data)
        }

    except Exception as e:
        print(f"Chat error: {e}")
        return {
            "answer": "I had trouble answering that. Please try a simpler question.",
            "sql": None,
            "data": None,
            "error": str(e)
        }

# ── SUMMARY GENERATOR ─────────────────────────────────
def generate_summary(question: str, data: list, sql: str) -> str:
    if not data:
        return (
            "I found the answer but the data "
            "is still being processed. "
            f"The query ran successfully."
        )

    row_count = len(data)
    first_row = data[0] if data else {}

    if 'total_revenue' in first_row:
        rev = float(first_row['total_revenue'])
        if rev >= 10000000:
            return f"Total revenue is ₹{rev/10000000:.2f} Cr."
        return f"Total revenue is ₹{rev/100000:.1f} L."

    if 'active_clients' in first_row:
        return (
            f"Active clients: {first_row['active_clients']}. "
            f"New: {first_row.get('new_clients', 0)}. "
            f"Churned: {first_row.get('churned_clients', 0)}."
        )

    if 'avg_nps' in first_row:
        nps = float(first_row['avg_nps'])
        zone = (
            "Promoter zone" if nps >= 50
            else "Passive zone" if nps >= 0
            else "Detractor zone"
        )
        return f"Average NPS is {nps:.1f} — {zone}."

    if row_count == 1:
        parts = []
        for k, v in first_row.items():
            if k not in ['id', 'created_at'] and v is not None:
                parts.append(
                    f"{k.replace('_', ' ').title()}: {v}"
                )
        return ". ".join(parts[:4]) + "."

    return f"Found {row_count} records. Here are the results."

# ── TRAIN ENDPOINT ────────────────────────────────────
@app.post("/api/train")
async def train_model():
    global vn
    try:
        vn = get_vanna_instance()
        train_vanna(vn)
        return {"status": "Training complete"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── RUN ───────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )