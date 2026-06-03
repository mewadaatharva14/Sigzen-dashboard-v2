'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis,
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

export default function RevenueGrowth() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedYear } = useYear()

  useEffect(() => {
    setLoading(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${apiUrl}/api/revenue/${selectedYear}`)
      .then(res => res.json())
      .then(json => {
        setData(json.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedYear])

  return (
    <ModuleCard
      title="Revenue Growth"
      icon="BarChart3"
      insight={`Revenue by service type for ${selectedYear}`}
      exportData={data}
      exportFilename={`revenue_growth_${selectedYear}`}
    >
      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                formatter={(value: any, name: string) => [formatTooltip(Number(value)), name]}
              />
              <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
              <Bar dataKey="license" stackId="a" fill="#3b82f6" name="License" />
              <Bar dataKey="implementation" stackId="a" fill="#a78bfa" name="Implementation" />
              <Bar dataKey="support" stackId="a" fill="#06b6d4" name="Support" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ModuleCard>
  )
}