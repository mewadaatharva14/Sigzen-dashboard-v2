'use client'
import Link from 'next/link'
import { PlugZap } from 'lucide-react'
import ModuleCard from '../ModuleCard'

// Shared bits for the live ERPNext deep-dive modules so they stay consistent.

export interface ERPResponse {
  data: any[]
  summary: Record<string, any>
  source: string
  error?: string
}

export const EMPTY_RESP: ERPResponse = { data: [], summary: {}, source: 'offline' }

export const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
]

// Map common ERPNext statuses to intuitive colors; fall back to the palette.
const STATUS_COLORS: Record<string, string> = {
  Open: '#3b82f6', Working: '#3b82f6', Submitted: '#3b82f6',
  Completed: '#10b981', Closed: '#10b981', Resolved: '#10b981',
  Converted: '#10b981', Ordered: '#10b981', Paid: '#10b981',
  Replied: '#f59e0b', Pending: '#f59e0b', 'To Deliver': '#f59e0b',
  'To Bill': '#f59e0b', 'To Receive': '#f59e0b', Quotation: '#f59e0b',
  Draft: '#94a3b8', Lead: '#94a3b8', Prospecting: '#94a3b8',
  Lost: '#ef4444', Cancelled: '#ef4444', Overdue: '#ef4444',
  Urgent: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#10b981',
}

export function statusColor(label: string, i = 0): string {
  return STATUS_COLORS[label] || PALETTE[i % PALETTE.length]
}

export function fmtCurrency(v: number): string {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(0)}K`
  return `₹${(v || 0).toLocaleString('en-IN')}`
}

// Dark, readable Recharts tooltip props (light text — the bug we fixed earlier).
export const tooltipProps = {
  contentStyle: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '10px 14px',
  },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#e2e8f0', fontWeight: 600 },
  cursor: { fill: 'rgba(255,255,255,0.05)' },
}

export function breakdownToData(obj: Record<string, number> | undefined): { name: string; value: number }[] {
  if (!obj) return []
  return Object.entries(obj)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value)
}

// A KPI tile matching the ERPNextAccounting style.
export function StatTile({ label, value, accent = 'blue', icon }: {
  label: string
  value: string | number
  accent?: 'blue' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'slate'
  icon?: React.ReactNode
}) {
  const accents: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    rose: 'bg-rose-500/10 text-rose-500',
    amber: 'bg-amber-500/10 text-amber-500',
    indigo: 'bg-indigo-500/10 text-indigo-500',
    slate: 'bg-slate-500/10 text-slate-400',
  }
  return (
    <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 truncate">{label}</p>
        <h4 className="text-lg font-bold text-slate-100 mt-1 truncate">{value}</h4>
      </div>
      {icon && <div className={`p-2.5 rounded-lg flex-shrink-0 ${accents[accent]}`}>{icon}</div>}
    </div>
  )
}

// Connect prompt (used if a module is somehow rendered while disconnected).
export function NotConnectedCard({ title, icon }: { title: string; icon: string }) {
  return (
    <ModuleCard title={title} icon={icon} insight="Connect an ERP system to see live data.">
      <div className="flex flex-col items-center justify-center h-60 text-center">
        <div className="p-3 bg-blue-500/10 rounded-full text-blue-400 mb-4">
          <PlugZap className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-semibold text-foreground mb-1">No ERP Connected</h4>
        <p className="text-sm text-muted-foreground max-w-sm mb-5">
          Connect your ERP to stream this data live into the dashboard.
        </p>
        <Link
          href="/connect"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlugZap className="w-4 h-4" />
          Connect your ERP
        </Link>
      </div>
    </ModuleCard>
  )
}

// Empty-state shown inside a connected module when a DocType has no records.
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-60 text-center text-slate-500">
      <p className="text-sm">{message}</p>
    </div>
  )
}
