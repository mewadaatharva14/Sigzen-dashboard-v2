import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client
from vanna_setup import get_vanna_instance, train_vanna
import psycopg2
import psycopg2.extras

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
    vn = get_vanna_instance()
    print("Vanna AI ready!")

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
@app.get("/api/years")
def get_available_years():
    try:
        sb = get_supabase()
        response = sb.table("financial_monthly")\
            .select("month")\
            .order("month", desc=True)\
            .execute()

        years = sorted(set([
            int(row["month"][:4])
            for row in response.data
        ]), reverse=True)

        return {
            "years": years,
            "default": years[0] if years else 2024
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