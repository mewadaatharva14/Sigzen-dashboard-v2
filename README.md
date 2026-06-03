# Sigzen BI Dashboard v2

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![Vanna AI](https://img.shields.io/badge/Vanna_AI-FF6B6B?style=flat)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=flat)
![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)

> *Sigzen BI is an advanced Business Intelligence platform designed for real-time tracking of ERP metrics. It empowers executives with AI-driven insights, multi-year financial analysis, and a customizable dashboard interface.*

## Overview

Sigzen BI provides a centralized view of organizational health, spanning financial performance, client growth, and operational efficiency. By integrating Vanna AI with Ollama, it enables users to query their business data using natural language, transforming complex database schemas into actionable visual insights.

## Project Structure

```text
Sigzen_Dashboard_v2/
├── frontend/             # Next.js 16 + TypeScript + Tailwind
│   ├── app/              # App router routes and page layouts
│   ├── components/       # Reusable UI and dashboard modules
│   ├── hooks/            # Custom React hooks (toast, mobile detection)
│   ├── lib/              # API clients, auth, and context providers
│   └── public/           # Static assets and icons
├── backend/              # Python FastAPI + Vanna AI
│   ├── main.py           # REST API endpoints and business logic
│   ├── vanna_setup.py    # Vanna AI training and vector store config
│   └── chroma_db/        # Local vector database for AI training
└── data/                 # SQL schemas and sample dataset files
```

## Features

| Feature | Status |
| :--- | :--- |
| **Year Filter** (Global context-aware) | ✅ built |
| **AI Chat Panel** (Natural Language to SQL) | ✅ built |
| **CSV Data Export** (Module-level) | ✅ built |
| **KPI Trend Indicators** (YoY change) | ✅ built |
| **Customization Panel** (Module visibility) | ✅ built |
| **Financial Health Tracking** | ✅ built |
| **Employee Utilization Metrics** | ✅ built |
| **Predictive Analytics** | 🔲 planned |

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI (Python)
- **AI/ML:** Vanna AI + Ollama (DeepSeek Coder)
- **Database Wrapper:** Supabase Python SDK
- **Environment:** Python 3.13

### Database & Infra
- **Core DB:** Supabase (PostgreSQL)
- **Vector DB:** ChromaDB (Local)
- **Hosting:** Vercel (Frontend), Render/Railway (Backend)

## Setup & Run

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials and Backend API URL
   ```
4. Start development server:
   ```bash
   pnpm dev
   ```

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Fill in Supabase, Ollama, and API keys
   ```
5. Initialize and train AI:
   ```bash
   python vanna_setup.py
   ```
6. Run the API server:
   ```bash
   python main.py
   ```

## Environment Variables

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous API key.
- `NEXT_PUBLIC_API_URL`: The URL of your running FastAPI backend.

### Backend (`backend/.env`)
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_KEY`: Supabase service role or anon key.
- `GEMINI_API_KEY`: API key for Google Gemini (optional fallback).
- `OLLAMA_HOST`: URL where Ollama is running (default: http://localhost:11434).
- `OLLAMA_MODEL`: The LLM used for SQL generation (e.g., deepseek-coder:6.7b).
- `FRONTEND_URL`: The URL of your frontend (for CORS).

## Architecture

```text
[ Browser ] 
     │
     ▼
[ Vercel (Next.js) ] <───> [ Supabase (Auth/DB) ]
     │
     ▼
[ Render (FastAPI) ] <───> [ Vanna AI + ChromaDB ]
     │                          │
     ▼                          ▼
[ Ollama (Local LLM) ]   [ Business Schema ]
```

## Key Implementation Details

**Why Vanna AI instead of raw LLM prompts?**
Vanna provides a RAG-based approach specifically for SQL, ensuring higher accuracy by training on DDL and business context before querying.

**Why Recharts instead of Chart.js?**
Recharts' declarative React-native components integrate seamlessly with Tailwind and provide better responsive behavior for dashboard grids.

**Why Supabase instead of raw PostgreSQL?**
Supabase provides an instant API layer, real-time subscriptions, and built-in auth, reducing backend boilerplate by 40%.

**Why Ollama instead of OpenAI?**
Ollama allows for local, private, and cost-effective SQL generation without sending sensitive database schemas to third-party providers.

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | API Status check |
| GET | `/health` | Service health status |
| GET | `/api/years` | Get list of available financial years |
| POST | `/api/chat` | Natural language to SQL query endpoint |
| POST | `/api/train` | Trigger Vanna AI training sequence |
| GET | `/api/financial/{year}` | Monthly financial health metrics |
| GET | `/api/revenue/{year}` | Revenue breakdown by service type |
| GET | `/api/clients/{year}` | Client growth and retention data |
| GET | `/api/website/{year}` | Website and ecommerce traffic metrics |

## References
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Vanna AI Documentation](https://vanna.ai/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Ollama Documentation](https://ollama.com/library)

## License
MIT License

---
<p align="center">Made with 🧠 by mewadaatharva14</p>
