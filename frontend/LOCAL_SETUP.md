# Sigzen CEO Business Intelligence Dashboard - Local Setup Guide

This dashboard is now fully configured to work with **Supabase Cloud PostgreSQL** on your local Mac.

## Quick Start

### 1. Install Dependencies

```bash
cd sigzen-bi-dashboard
pnpm install
# or
npm install
# or
yarn install
```

### 2. Set Up Supabase

Create your `.env.local` file:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create Database Tables

Follow the steps in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase account
- Get your API credentials
- Run the SQL schema to create all tables

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
sigzen-bi-dashboard/
├── app/
│   ├── page.tsx                 # Main dashboard page
│   ├── layout.tsx               # Root layout with theme support
│   └── globals.css              # Global styles and design tokens
│
├── components/
│   └── dashboard/
│       ├── Header.tsx           # Top navigation bar
│       ├── Sidebar.tsx          # Left sidebar navigation
│       ├── DashboardGrid.tsx    # Main dashboard grid layout
│       ├── CustomizePanel.tsx   # Module customization panel
│       ├── KPICard.tsx          # Summary KPI cards
│       ├── ModuleCard.tsx       # Module card wrapper
│       ├── SparklineChart.tsx   # Mini sparkline charts
│       └── modules/             # Dashboard modules
│           ├── FinancialHealth.tsx
│           ├── RevenueGrowth.tsx
│           ├── CustomerGrowth.tsx
│           ├── EmployeeEfficiency.tsx
│           ├── ProjectDelivery.tsx
│           ├── CustomerSatisfaction.tsx
│           ├── RiskAlerts.tsx
│           ├── PurchaseHealth.tsx
│           ├── QualityControl.tsx
│           ├── InventorySupply.tsx
│           ├── EcommerceAnalytics.tsx
│           └── Gauge.tsx
│
├── lib/
│   ├── supabase.ts              # Supabase client initialization
│   ├── api.ts                   # API functions for data fetching
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # Utility functions
│
├── hooks/
│   ├── use-mobile.tsx           # Mobile detection hook
│   └── useAsync.ts              # Async data fetching hook
│
├── database/
│   └── schema.sql               # SQL migrations for Supabase
│
├── .env.local.example           # Environment variables template
├── SUPABASE_SETUP.md            # Detailed Supabase setup instructions
└── README.md                    # This file
```

## Files for Supabase Integration

### Core Files

1. **`lib/supabase.ts`** - Supabase client initialization
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   export const supabase = createClient(url, key)
   ```

2. **`lib/api.ts`** - All data fetching functions
   - `getFinancialData()`
   - `getRevenueByService()`
   - `getClientGrowthData()`
   - `getEmployeeEfficiencyData()`
   - `getProjectData()`
   - `getCustomerSatisfactionData()`
   - `getRiskAlerts()`
   - And more...

3. **`lib/types.ts`** - TypeScript interfaces for all data models
   - `DashboardMetrics`
   - `FinancialData`
   - `RevenueByService`
   - `RiskAlert`
   - etc.

4. **`database/schema.sql`** - SQL migrations
   - Copy & paste into Supabase SQL Editor
   - Creates 12 tables with sample data
   - Includes indexes for performance

5. **`.env.local`** - Environment variables (DON'T COMMIT)
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

6. **`.env.local.example`** - Template (safe to commit)
   - Shows required environment variables
   - Reference for other developers

### Example: Using Supabase Data

The `FinancialHealth.tsx` component shows how to fetch data:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getFinancialData } from '@/lib/api'
import { FinancialData } from '@/lib/types'

export default function FinancialHealth() {
  const [data, setData] = useState<FinancialData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const financialData = await getFinancialData()
      setData(financialData)
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div>
      {loading ? 'Loading...' : /* render chart with data */}
    </div>
  )
}
```

## How to Connect Your Data

### Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a project (or use existing)
3. Go to **Settings > API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Update `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Create Database Tables

1. In Supabase: Go to **SQL Editor > New Query**
2. Copy entire contents of `database/schema.sql`
3. Paste into Supabase SQL Editor
4. Click **Run**
5. Wait for tables to be created

### Step 4: Verify Connection

```bash
pnpm dev
```

- Open browser console (F12)
- Check for Supabase connection warnings
- If connected, you should see data from Supabase
- If not, check `.env.local` and browser console errors

## Updating Components to Use Real Data

Each dashboard module can be updated to fetch real data. Example:

```typescript
// Before: Hardcoded data
const data = [
  { month: 'Jan', revenue: 4500000 },
  // ...
]

// After: Fetch from Supabase
import { getFinancialData } from '@/lib/api'

const [data, setData] = useState([])
useEffect(() => {
  getFinancialData().then(setData)
}, [])
```

## Available Data Functions

All in `lib/api.ts`:

```typescript
// Fetch functions
getFinancialData()              // Monthly revenue, expenses, profit
getRevenueByService()           // Revenue breakdown
getClientGrowthData()           // Client metrics
getEmployeeEfficiencyData()     // Department utilization
getProjectData()                // Project status
getCustomerSatisfactionData()   // NPS and support tickets
getRiskAlerts()                 // Risk management
getPurchaseData()               // Vendor spending
getQualityMetrics()             // QA metrics
getInventoryData()              // Asset inventory
getEcommerceMetrics()           // E-commerce data
getDashboardMetrics()           // KPI summary
```

## Database Tables

| Table | Purpose | Records |
|-------|---------|---------|
| dashboard_metrics | Summary KPIs | 1 |
| financial_data | Monthly financials | 12 |
| revenue_by_service | Service breakdown | 3 |
| client_growth_data | Client trends | 12 |
| employee_efficiency_data | Department utilization | 5 |
| project_data | Project status | 5 |
| customer_satisfaction_data | NPS & support | 1 |
| risk_alerts | Risk alerts | 8 |
| purchase_data | Vendor spending | 4 |
| quality_metrics | QA metrics | 4 |
| inventory_data | Asset inventory | 4 |
| ecommerce_metrics | E-commerce data | 3 |

## Common Issues

### Environment Variables Not Working

1. Restart dev server after updating `.env.local`
2. Verify file is in project root (not nested)
3. Variables must start with `NEXT_PUBLIC_` to be accessible in browser
4. No spaces around `=` in `.env.local`

### "Supabase credentials not found" Warning

This appears in console if:
- `.env.local` file doesn't exist
- Environment variables are empty
- Dev server wasn't restarted after creating `.env.local`

### Data Not Appearing

1. Check database tables exist in Supabase
2. Verify tables have data (insert sample data from schema.sql)
3. Check browser Network tab for Supabase requests
4. Open browser Console (F12) to see error messages

## Next Steps

1. Update all dashboard modules to use Supabase data
2. Add real-time subscriptions with `supabase.from().on()`
3. Implement user authentication
4. Add ability to update/edit data
5. Deploy to Vercel

## Scripts

```bash
# Development
pnpm dev          # Start dev server

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Linting
pnpm lint         # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16
- **UI**: React 19 with shadcn/ui
- **Charts**: Recharts
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Recharts Docs](https://recharts.org)

## Support

If you encounter issues:

1. Check the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide
2. Review error messages in browser Console (F12)
3. Verify environment variables in `.env.local`
4. Check Supabase project status and credentials
5. Ensure database tables exist and have data

---

Created with v0 for Sigzen Technologies
