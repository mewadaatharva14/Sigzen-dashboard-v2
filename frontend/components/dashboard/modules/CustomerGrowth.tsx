'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ModuleCard from '../ModuleCard'
import { useYear } from '@/lib/yearContext'

export default function CustomerGrowth() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedYear } = useYear()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    setLoading(true)
    fetch(`${apiUrl}/api/clients/${selectedYear}`)
      .then(res => res.json())
      .then(json => {
        setData(json.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedYear])

  const lastRow = data[data.length - 1]
  const insight = lastRow
    ? `${lastRow.active_clients} active clients in ${selectedYear}`
    : `Customer growth for ${selectedYear}`

  return (
    <ModuleCard
      title="Customer Growth"
      icon="Users"
      insight={insight}
      exportData={data}
      exportFilename={`customer_growth_${selectedYear}`}
    >
      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="active_clients"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Active Clients"
              />
              <Line
                type="monotone"
                dataKey="new_clients"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="New Clients"
              />
              <Line
                type="monotone"
                dataKey="churned_clients"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Churned Clients"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </ModuleCard>
  )
}