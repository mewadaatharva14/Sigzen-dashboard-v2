'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ModuleCard from '../ModuleCard'

export default function EcommerceAnalytics() {
  const data = [
    { month: 'Jan', traffic: 45000, leads: 1200, conversions: 240 },
    { month: 'Feb', traffic: 52000, leads: 1450, conversions: 290 },
    { month: 'Mar', traffic: 48000, leads: 1350, conversions: 270 },
    { month: 'Apr', traffic: 61000, leads: 1800, conversions: 360 },
    { month: 'May', traffic: 70000, leads: 2100, conversions: 420 },
    { month: 'Jun', traffic: 85000, leads: 2500, conversions: 500 },
  ]

  return (
    <ModuleCard
      title="Website / eCommerce"
      icon="Globe"
      insight="Q2 conversion rate: 5.9% — 18% increase YoY"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="traffic"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorTraffic)"
              name="Traffic"
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorLeads)"
              name="Leads"
            />
            <Area
              type="monotone"
              dataKey="conversions"
              stroke="#a78bfa"
              fillOpacity={1}
              fill="url(#colorConversions)"
              name="Conversions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ModuleCard>
  )
}
