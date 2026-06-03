# Supabase Integration Guide

This dashboard is fully integrated with Supabase PostgreSQL. Follow these steps to connect your local project to Supabase.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Enter a project name: `sigzen-bi-dashboard`
4. Choose a strong password and save it
5. Select your region (closest to you)
6. Click "Create new project" and wait for it to initialize (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public)**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Set Up Environment Variables

1. In your project root, create a `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Save the file

## Step 4: Create Database Tables

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Open the file: `database/schema.sql` in your project
4. Copy and paste the entire SQL content into the Supabase SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for all tables to be created (you should see success messages)

The schema includes:
- 11 data tables for all dashboard metrics
- Sample data for testing
- Indexes for performance
- Proper constraints and validations

## Step 5: Verify Connection

1. Restart your dev server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. Open http://localhost:3000
3. Check the browser console for any Supabase connection warnings
4. The dashboard should load with data from your Supabase database

## File Structure

```
lib/
├── supabase.ts          # Supabase client initialization
├── types.ts             # TypeScript interfaces for all data models
└── api.ts               # API functions to fetch data from Supabase

database/
└── schema.sql           # SQL migrations to create all tables

.env.local              # Your local environment variables (DO NOT COMMIT)
.env.local.example      # Template for environment variables (commit this)
```

## Using Supabase Functions in Your Code

### In React Components (Client Components)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getFinancialData } from '@/lib/api'
import { FinancialData } from '@/lib/types'

export default function MyComponent() {
  const [data, setData] = useState<FinancialData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const result = await getFinancialData()
      setData(result)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  return <div>{/* Render your data */}</div>
}
```

### In Server Components

```typescript
import { getFinancialData } from '@/lib/api'

export default async function MyComponent() {
  const data = await getFinancialData()
  return <div>{/* Render your data */}</div>
}
```

## Available API Functions

All functions are in `lib/api.ts`:

- `getDashboardMetrics()` - Summary KPI metrics
- `getFinancialData()` - Monthly revenue, expenses, profit
- `getRevenueByService()` - Revenue breakdown by service type
- `getClientGrowthData()` - Client acquisition and churn
- `getEmployeeEfficiencyData()` - Department utilization rates
- `getProjectData()` - Project delivery status
- `getCustomerSatisfactionData()` - NPS and support tickets
- `getRiskAlerts()` - All risk alerts
- `getPurchaseData()` - Vendor spend by category
- `getQualityMetrics()` - Bug reports and sprint velocity
- `getInventoryData()` - Asset inventory
- `getEcommerceMetrics()` - Website traffic and conversions

## Database Schema

### Tables Created:

1. **dashboard_metrics** - Summary KPIs
2. **financial_data** - Monthly financials
3. **revenue_by_service** - Service revenue breakdown
4. **client_growth_data** - Client metrics
5. **employee_efficiency_data** - Department utilization
6. **project_data** - Project status tracking
7. **customer_satisfaction_data** - NPS and support metrics
8. **risk_alerts** - Risk management
9. **purchase_data** - Vendor spending
10. **quality_metrics** - Quality and sprint metrics
11. **inventory_data** - Asset inventory
12. **ecommerce_metrics** - E-commerce analytics

## Troubleshooting

### "Supabase credentials not found" Warning

This means environment variables are not set. Check:
1. `.env.local` file exists in project root
2. `NEXT_PUBLIC_SUPABASE_URL` is set correctly
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
4. Restart your dev server after updating `.env.local`

### "Failed to fetch data" Errors

Check:
1. Supabase project is running (check Supabase dashboard)
2. Database tables exist (check in Supabase > Table Editor)
3. Network tab in browser DevTools for CORS issues
4. Supabase project has "Additional Redirects" configured if needed

### Data Not Appearing

1. Verify tables have data: Go to Supabase > Table Editor
2. Run sample data insertions from `database/schema.sql`
3. Check browser console for error messages
4. Verify anon key has read permissions

## Next Steps

1. Update components in `components/dashboard/modules/` to use real Supabase data
2. Add real-time subscriptions using `supabase.from('table').on()`
3. Implement authentication if needed
4. Add insert/update functions for dashboard edits
5. Deploy to production with Vercel

## Security Notes

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public variables (safe to expose)
- For sensitive operations, create server-side functions using service role key
- Store `SUPABASE_SERVICE_ROLE_KEY` only in server environment variables
- Enable Row Level Security (RLS) policies for production

## Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [NextJS with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
