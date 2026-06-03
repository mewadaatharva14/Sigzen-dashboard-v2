'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Gauge } from './Gauge'
import ModuleCard from '../ModuleCard'
import { supabase } from '@/lib/supabase'

export default function CustomerSatisfaction() {
  const [npsScore, setNpsScore] = useState<number>(0)
  const [ticketData, setTicketData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [npsRes, ticketsRes] = await Promise.all([
          supabase
            .from('nps_scores')
            .select('nps_score, promoters_pct, detractors_pct, passives_pct'),
          supabase
            .from('support_tickets')
            .select('status, priority')
        ])

        // Calculate average NPS
        if (npsRes.data && npsRes.data.length > 0) {
          const avg = npsRes.data.reduce(
            (sum: number, row: any) => sum + Number(row.nps_score || 0), 0
          ) / npsRes.data.length
          setNpsScore(Math.round(avg))
        }

        // Count tickets by status
        if (ticketsRes.data) {
          const resolved = ticketsRes.data.filter(
            (t: any) => t.status === 'Resolved'
          ).length
          const open = ticketsRes.data.filter(
            (t: any) => t.status === 'Open'
          ).length
          const overdue = ticketsRes.data.filter(
            (t: any) => t.status === 'Open' && t.priority === 'High'
          ).length

          setTicketData([
            { name: 'Resolved', value: resolved, color: '#10b981' },
            { name: 'Pending', value: open - overdue, color: '#fbbf24' },
            { name: 'Overdue', value: overdue, color: '#ef4444' },
          ])
        }
      } catch (err) {
        console.error('CustomerSatisfaction error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const npsZone = npsScore >= 50
    ? 'Promoter zone'
    : npsScore >= 0
    ? 'Passive zone'
    : 'Detractor zone'

  return (
    <ModuleCard
      title="Customer Satisfaction"
      icon="Smile"
      insight={`NPS at ${npsScore} — ${npsZone}`}
      exportData={ticketData}
      exportFilename="customer_satisfaction"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* NPS Gauge */}
            <div className="h-40 flex items-center justify-center">
              <Gauge value={npsScore} />
            </div>

            {/* Support Tickets */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground mb-4">
                Support Tickets
              </h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ticketData}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 80, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <XAxis
                      type="number"
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fontSize: 11 }}
                      width={75}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {ticketData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </ModuleCard>
  )
}