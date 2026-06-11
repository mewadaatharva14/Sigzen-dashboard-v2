'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { AlertTriangle, CheckCircle2, Inbox, Flag } from 'lucide-react'
import ModuleCard from '../ModuleCard'
import { useERPSession } from '@/lib/session-context'
import { getSessionIssues } from '@/lib/erpnext-api'
import {
  ERPResponse, EMPTY_RESP, NotConnectedCard, EmptyState, StatTile,
  tooltipProps, statusColor, breakdownToData,
} from './erpnextShared'

function CountBar({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  if (data.length === 0) return <EmptyState message="No issues found in ERPNext." />
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} width={110} />
          <Tooltip {...tooltipProps} />
          <Bar dataKey="value" name={label} radius={[0, 6, 6, 0]}>
            {data.map((d, i) => <Cell key={i} fill={statusColor(d.name, i)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function ERPNextSupport() {
  const { sessionId, isConnected, isLoading: sessionLoading } = useERPSession()
  const [issues, setIssues] = useState<ERPResponse>(EMPTY_RESP)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !sessionId) { setLoading(false); return }
    async function load() {
      setLoading(true)
      try {
        setIssues(await getSessionIssues(sessionId!))
      } finally { setLoading(false) }
    }
    load()
  }, [sessionId, isConnected])

  if (!isConnected && !sessionLoading) return <NotConnectedCard title="Support (Live)" icon="AlertTriangle" />

  return (
    <ModuleCard
      title="Support (Live)"
      icon="AlertTriangle"
      insight="Live support tickets, priority breakdown and resolution rate from ERPNext"
      exportData={issues.data}
      exportFilename="erpnext_support_issues"
    >
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Fetching live data...</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Issues" value={issues.summary.total_count ?? 0} accent="blue" icon={<Inbox className="w-5 h-5" />} />
        <StatTile label="Open" value={issues.summary.open_count ?? 0} accent="amber" icon={<AlertTriangle className="w-5 h-5" />} />
        <StatTile label="Resolved" value={issues.summary.closed_count ?? 0} accent="emerald" icon={<CheckCircle2 className="w-5 h-5" />} />
        <StatTile label="Resolution" value={`${issues.summary.resolution_rate_pct ?? 0}%`} accent="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">By Status</p>
          <CountBar data={breakdownToData(issues.summary.status_breakdown)} label="Issues" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" /> By Priority</p>
          <CountBar data={breakdownToData(issues.summary.priority_breakdown)} label="Issues" />
        </div>
      </div>
    </ModuleCard>
  )
}
