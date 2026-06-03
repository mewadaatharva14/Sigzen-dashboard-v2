# Supabase Integration - Code Examples

This file contains quick reference code snippets for working with Supabase in this project.

## 1. Basic Setup

### Initialize Supabase Client

**File: `lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Environment Variables

**File: `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. Fetching Data in Components

### Basic Data Fetch

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getFinancialData } from '@/lib/api'
import { FinancialData } from '@/lib/types'

export default function MyComponent() {
  const [data, setData] = useState<FinancialData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getFinancialData()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data.length) return <div>No data</div>

  return <div>{/* Render your data */}</div>
}
```

### Using Custom Hook

```typescript
'use client'

import { useAsync } from '@/hooks/useAsync'
import { getFinancialData } from '@/lib/api'

export default function MyComponent() {
  const { data, loading, error } = useAsync(getFinancialData)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{/* Render data */}</div>
}
```

## 3. Common Queries

### Fetch All Financial Data

```typescript
import { getFinancialData } from '@/lib/api'

const financialData = await getFinancialData()
// Returns: FinancialData[] ordered by month
```

### Fetch Latest Metrics

```typescript
import { getDashboardMetrics } from '@/lib/api'

const metrics = await getDashboardMetrics()
// Returns: DashboardMetrics | null
```

### Fetch All Risk Alerts

```typescript
import { getRiskAlerts } from '@/lib/api'

const alerts = await getRiskAlerts()
// Returns: RiskAlert[] ordered by created_at descending
```

## 4. Direct Supabase Queries

### Query Directly (Advanced)

```typescript
import { supabase } from '@/lib/supabase'

// Select data
const { data, error } = await supabase
  .from('financial_data')
  .select('*')
  .eq('month', 'Jan 2024')
  .single()

// Insert data
const { data, error } = await supabase
  .from('risk_alerts')
  .insert([
    {
      title: 'New Alert',
      description: 'Alert description',
      severity: 'high',
      department: 'Engineering',
      action_required: 'Action required'
    }
  ])

// Update data
const { data, error } = await supabase
  .from('financial_data')
  .update({ revenue: 5000000 })
  .eq('month', 'Jan 2024')

// Delete data
const { error } = await supabase
  .from('risk_alerts')
  .delete()
  .eq('id', 'alert-id')
```

## 5. Real-time Subscriptions

### Subscribe to Table Changes

```typescript
import { supabase } from '@/lib/supabase'

useEffect(() => {
  const subscription = supabase
    .from('financial_data')
    .on('*', (payload) => {
      console.log('Change received!', payload)
      // Refetch data or update state
    })
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

## 6. TypeScript Types

### Using Types in Components

```typescript
import { FinancialData, RiskAlert, ProjectData } from '@/lib/types'

interface DashboardState {
  financial: FinancialData[]
  risks: RiskAlert[]
  projects: ProjectData[]
}

const [state, setState] = useState<DashboardState>({
  financial: [],
  risks: [],
  projects: [],
})
```

## 7. Error Handling

### Try-Catch Pattern

```typescript
import { getFinancialData } from '@/lib/api'

async function loadData() {
  try {
    const data = await getFinancialData()
    // Process data
  } catch (error) {
    console.error('[v0] Error loading financial data:', error)
    // Show fallback UI
  }
}
```

## 8. Complete Module Example

```typescript
'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getFinancialData } from '@/lib/api'
import { FinancialData } from '@/lib/types'
import ModuleCard from '../ModuleCard'

export default function FinancialHealth() {
  const [data, setData] = useState<FinancialData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const financialData = await getFinancialData()
        setData(financialData)
      } catch (error) {
        console.error('[v0] Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fallback to dummy data if Supabase not configured
  const displayData = data.length > 0 ? data : [
    { month: 'Jan', revenue: 4500000, expenses: 3200000, profit: 1300000 },
  ]

  const formatCurrency = (value: number) => `₹${(value / 1000000).toFixed(1)}Cr`

  return (
    <ModuleCard title="Financial Health" icon="TrendingUp" insight="Profit margin at 38.2%">
      <div className="h-80">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <CartesianGrid />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </ModuleCard>
  )
}
```

## 9. Database Schema Reference

### Financial Data Table

```sql
CREATE TABLE financial_data (
  id UUID PRIMARY KEY,
  month VARCHAR(10),
  revenue NUMERIC(15, 2),
  expenses NUMERIC(15, 2),
  profit NUMERIC(15, 2),
  created_at TIMESTAMP
)
```

### Risk Alerts Table

```sql
CREATE TABLE risk_alerts (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  severity VARCHAR(20),
  department VARCHAR(100),
  action_required TEXT,
  created_at TIMESTAMP
)
```

## 10. Debugging Tips

### Check Supabase Connection

```typescript
import { supabase } from '@/lib/supabase'

// Test connection in browser console
const { data, error } = await supabase.from('financial_data').select('count', { count: 'exact' })
console.log('Row count:', data)
```

### Enable Debug Logging

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
  },
})

// Check connection
console.log('[v0] Supabase initialized:', supabase ? 'Yes' : 'No')
```

### Verify Environment Variables

```typescript
console.log('[v0] SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
console.log('[v0] SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
```

## Quick Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `getFinancialData()` | Monthly financials | `FinancialData[]` |
| `getRevenueByService()` | Service breakdown | `RevenueByService[]` |
| `getClientGrowthData()` | Client metrics | `ClientGrowthData[]` |
| `getEmployeeEfficiencyData()` | Department utilization | `EmployeeEfficiencyData[]` |
| `getProjectData()` | Project status | `ProjectData[]` |
| `getCustomerSatisfactionData()` | NPS & support | `CustomerSatisfactionData \| null` |
| `getRiskAlerts()` | Risk alerts | `RiskAlert[]` |
| `getPurchaseData()` | Vendor spending | `PurchaseData[]` |
| `getQualityMetrics()` | QA metrics | `QualityMetrics[]` |
| `getInventoryData()` | Asset inventory | `InventoryData[]` |
| `getEcommerceMetrics()` | E-commerce data | `EcommerceMetrics[]` |
| `getDashboardMetrics()` | KPI summary | `DashboardMetrics \| null` |

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript
- **Next.js Guide**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **React Hooks**: https://react.dev/reference/react

---

For more details, see:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Detailed setup instructions
- [LOCAL_SETUP.md](./LOCAL_SETUP.md) - Local development guide
