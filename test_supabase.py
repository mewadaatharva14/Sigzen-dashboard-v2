import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print(f"Connecting to: {url}")
print(f"Using key: {key[:10]}...")

try:
    sb = create_client(url, key)
    # Try a simple select
    response = sb.table("financial_monthly").select("*").limit(1).execute()
    print("REST API Connection successful!")
    print(response.data)
except Exception as e:
    print(f"REST API Connection failed: {e}")
