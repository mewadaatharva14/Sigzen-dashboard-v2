'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import ModuleCard from '../ModuleCard'
import { supabase } from '@/lib/supabase'

export default function ProjectDelivery() {
  const [statusData, setStatusData] = useState<any[]>([])
  const [atRisk, setAtRisk] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const colors: Record<string, string> = {
    'Completed': '#10b981',
    'In Progress': '#3b82f6',
    'Delayed': '#ef4444',
    'On Hold': '#fbbf24',
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // Get all projects with client names
        const { data: projects, error } = await supabase
          .from('projects')
          .select('id, project_name, status, planned_end_date, actual_end_date, client_id')

        if (error) throw error
        if (!projects) return

        // Get client names separately
        const clientIds = [...new Set(projects.map((p: any) => p.client_id).filter(Boolean))]
        let clientMap: Record<number, string> = {}

        if (clientIds.length > 0) {
          const { data: clients } = await supabase
            .from('clients')
            .select('id, company_name')
            .in('id', clientIds)

          clients?.forEach((c: any) => {
            clientMap[c.id] = c.company_name
          })
        }

        // Build status summary
        const statusMap: Record<string, number> = {}
        projects.forEach((p: any) => {
          const s = p.status || 'Unknown'
          statusMap[s] = (statusMap[s] || 0) + 1
        })

        const summary = Object.entries(statusMap)
          .map(([name, value]) => ({
            name,
            value,
            color: colors[name] || '#94a3b8'
          }))
          .sort((a, b) => b.value - a.value)

        setStatusData(summary)

        // At risk projects
        const risky = projects
          .filter((p: any) =>
            p.status === 'Delayed' ||
            p.status === 'On Hold' ||
            p.status === 'In Progress'
          )
          .slice(0, 4)
          .map((p: any) => ({
            name: clientMap[p.client_id] || p.project_name || 'Unknown',
            status: p.status,
          }))

        setAtRisk(risky)
      } catch (err) {
        console.error('ProjectDelivery error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const delayedCount = statusData.find(s => s.name === 'Delayed')?.value || 0
  const completedCount = statusData.find(s => s.name === 'Completed')?.value || 0

  return (
    <ModuleCard
      title="Project Delivery"
      icon="Layout"
      insight={
        delayedCount > 0
          ? `${delayedCount} delayed — ${completedCount} completed`
          : `${completedCount} projects completed successfully`
      }
      exportData={statusData}
      exportFilename="project_delivery"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Donut Chart */}
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                    }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                    formatter={(value: any, name: any) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>

            {/* At Risk List */}
            {atRisk.length > 0 && (
              <div className="pt-3 border-t border-border space-y-2">
                <h4 className="text-sm font-semibold text-foreground">
                  At-Risk Projects
                </h4>
                {atRisk.map((project, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <span className="text-xs text-foreground truncate max-w-[140px]">
                      {project.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      project.status === 'Delayed'
                        ? 'bg-red-500/20 text-red-400'
                        : project.status === 'On Hold'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ModuleCard>
  )
}