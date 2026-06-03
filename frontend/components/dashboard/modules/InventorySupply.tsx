'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import ModuleCard from '../ModuleCard'

export default function InventorySupply() {
  const data = [
    { name: 'Hardware', value: 35, color: '#3b82f6' },
    { name: 'Software Licenses', value: 25, color: '#a78bfa' },
    { name: 'Cloud Services', value: 20, color: '#06b6d4' },
    { name: 'Other', value: 20, color: '#fbbf24' },
  ]

  return (
    <ModuleCard
      title="Inventory & Supply Chain"
      icon="Package"
      insight="Total asset allocation: ₹245 Lakhs"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full grid grid-cols-2 gap-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-foreground">{item.name}</span>
              <span className="text-sm font-semibold text-foreground ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </ModuleCard>
  )
}
