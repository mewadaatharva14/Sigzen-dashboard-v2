'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ModuleCard from '../ModuleCard'

export default function PurchaseHealth() {
  const data = [
    { category: 'Software', vendor: 2500000 },
    { category: 'Hardware', vendor: 1800000 },
    { category: 'Services', vendor: 3200000 },
    { category: 'Maintenance', vendor: 950000 },
  ]

  const formatCurrency = (value: number) => `₹${(value / 1000000).toFixed(1)}Cr`

  return (
    <ModuleCard
      title="Purchase Health"
      icon="ShoppingCart"
      insight="Annual vendor spend: ₹8.45Cr"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="category" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={formatCurrency} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              formatter={(value: any) => formatCurrency(value)}
            />
            <Bar dataKey="vendor" fill="#06b6d4" name="Spend" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ModuleCard>
  )
}
