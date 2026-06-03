'use client'
import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import ModuleCard from '../ModuleCard'
import { useYear } from '@/lib/yearContext'

function formatYAxis(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

function formatTooltip(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  return `₹${value.toLocaleString('en-IN')}`
}

export default function FinancialHealth() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedYear } = useYear()

  useEffect(() => {
    setLoading(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${apiUrl}/api/financial/${selectedYear}`)
      .then(res => res.json())
      .then(json => {
        setData(json.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedYear])

  return (
    <ModuleCard
      title="Financial Health"
      icon="TrendingUp"
      insight={`Revenue & profit trend for ${selectedYear}`}
      exportData={data}
      exportFilename={`financial_health_${selectedYear}`}
    >
      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} tickFormatter={formatYAxis} width={65} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}
                formatter={(value: any, name: string) => [formatTooltip(Number(value)), name]}
              />
              <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </ModuleCard>
  )
}