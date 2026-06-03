'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ModuleCard from '../ModuleCard'

export default function QualityControl() {
  const data = [
    { sprint: 'Sprint 1', bugs: 24, velocity: 32 },
    { sprint: 'Sprint 2', bugs: 18, velocity: 28 },
    { sprint: 'Sprint 3', bugs: 12, velocity: 35 },
    { sprint: 'Sprint 4', bugs: 8, velocity: 40 },
    { sprint: 'Sprint 5', bugs: 15, velocity: 38 },
    { sprint: 'Sprint 6', bugs: 10, velocity: 42 },
  ]

  return (
    <ModuleCard
      title="Quality Control"
      icon="BarChart3"
      insight="Bug reduction: 58% improvement over 6 sprints"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="sprint" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" dataKey="bugs" stroke="#ef4444" strokeWidth={2} dot={false} name="Bug Reports" />
            <Line type="monotone" dataKey="velocity" stroke="#10b981" strokeWidth={2} dot={false} name="Sprint Velocity" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ModuleCard>
  )
}
