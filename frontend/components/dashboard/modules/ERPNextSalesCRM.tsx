'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Users, Target, FileText, ShoppingBag, TrendingUp } from 'lucide-react'
import ModuleCard from '../ModuleCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useERPSession } from '@/lib/session-context'
import {
  getSessionLeads, getSessionOpportunities, getSessionQuotations, getSessionSalesOrders,
} from '@/lib/erpnext-api'
import {
  ERPResponse, EMPTY_RESP, NotConnectedCard, EmptyState, StatTile,
  tooltipProps, statusColor, breakdownToData, fmtCurrency,
} from './erpnextShared'

function StatusBar({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <EmptyState message="No records found in ERPNext for this view." />
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} width={110} />
          <Tooltip {...tooltipProps} />
          <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]}>
            {data.map((d, i) => <Cell key={i} fill={statusColor(d.name, i)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function ERPNextSalesCRM() {
  const { sessionId, isConnected, isLoading: sessionLoading } = useERPSession()
  const [tab, setTab] = useState('leads')
  const [leads, setLeads] = useState<ERPResponse>(EMPTY_RESP)
  const [opps, setOpps] = useState<ERPResponse>(EMPTY_RESP)
  const [quotes, setQuotes] = useState<ERPResponse>(EMPTY_RESP)
  const [orders, setOrders] = useState<ERPResponse>(EMPTY_RESP)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !sessionId) { setLoading(false); return }
    async function load() {
      setLoading(true)
      try {
        const [l, o, q, so] = await Promise.all([
          getSessionLeads(sessionId!), getSessionOpportunities(sessionId!),
          getSessionQuotations(sessionId!), getSessionSalesOrders(sessionId!),
        ])
        setLeads(l); setOpps(o); setQuotes(q); setOrders(so)
      } finally { setLoading(false) }
    }
    load()
  }, [sessionId, isConnected])

  if (!isConnected && !sessionLoading) return <NotConnectedCard title="Sales & CRM (Live)" icon="Users" />

  const exportData =
    tab === 'leads' ? leads.data : tab === 'opps' ? opps.data : tab === 'quotes' ? quotes.data : orders.data

  return (
    <ModuleCard
      title="Sales & CRM (Live)"
      icon="Users"
      insight="Live lead funnel, opportunity pipeline, quotations & orders from ERPNext"
      exportData={exportData}
      exportFilename={`erpnext_crm_${tab}`}
    >
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <TabsList className="bg-[#1e293b]/60 border border-slate-800 p-0.5 rounded-lg">
            <TabsTrigger value="leads" className="px-3 py-1.5 text-xs sm:text-sm">Leads</TabsTrigger>
            <TabsTrigger value="opps" className="px-3 py-1.5 text-xs sm:text-sm">Opportunities</TabsTrigger>
            <TabsTrigger value="quotes" className="px-3 py-1.5 text-xs sm:text-sm">Quotations</TabsTrigger>
            <TabsTrigger value="orders" className="px-3 py-1.5 text-xs sm:text-sm">Orders</TabsTrigger>
          </TabsList>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Fetching live data...</span>
            </div>
          )}
        </div>

        {/* LEADS */}
        <TabsContent value="leads" className="mt-0 outline-none">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Total Leads" value={leads.summary.total_count ?? 0} accent="blue" icon={<Users className="w-5 h-5" />} />
            <StatTile label="Converted" value={leads.summary.converted_count ?? 0} accent="emerald" icon={<TrendingUp className="w-5 h-5" />} />
            <StatTile label="Open" value={leads.summary.open_count ?? 0} accent="amber" icon={<Target className="w-5 h-5" />} />
            <StatTile label="Conversion" value={`${leads.summary.conversion_rate_pct ?? 0}%`} accent="indigo" />
          </div>
          <StatusBar data={breakdownToData(leads.summary.status_breakdown)} />
        </TabsContent>

        {/* OPPORTUNITIES */}
        <TabsContent value="opps" className="mt-0 outline-none">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Total Opportunities" value={opps.summary.total_count ?? 0} accent="blue" icon={<Target className="w-5 h-5" />} />
            <StatTile label="Won" value={opps.summary.won_count ?? 0} accent="emerald" />
            <StatTile label="Lost" value={opps.summary.lost_count ?? 0} accent="rose" />
            <StatTile label="Win Rate" value={`${opps.summary.win_rate_pct ?? 0}%`} accent="indigo" icon={<TrendingUp className="w-5 h-5" />} />
          </div>
          <StatusBar data={breakdownToData(opps.summary.stage_breakdown)} />
        </TabsContent>

        {/* QUOTATIONS */}
        <TabsContent value="quotes" className="mt-0 outline-none">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Total Quotations" value={quotes.summary.total_count ?? 0} accent="blue" icon={<FileText className="w-5 h-5" />} />
            <StatTile label="Ordered" value={quotes.summary.ordered_count ?? 0} accent="emerald" />
            <StatTile label="Lost" value={quotes.summary.lost_count ?? 0} accent="rose" />
            <StatTile label="Total Value" value={fmtCurrency(quotes.summary.total_value ?? 0)} accent="indigo" />
          </div>
          <StatusBar data={statusFromRows(quotes.data, 'status')} />
        </TabsContent>

        {/* ORDERS */}
        <TabsContent value="orders" className="mt-0 outline-none">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Total Orders" value={orders.summary.total_count ?? 0} accent="blue" icon={<ShoppingBag className="w-5 h-5" />} />
            <StatTile label="Delivered" value={orders.summary.delivered_count ?? 0} accent="emerald" />
            <StatTile label="Draft" value={orders.summary.draft_count ?? 0} accent="slate" />
            <StatTile label="Total Value" value={fmtCurrency(orders.summary.total_value ?? 0)} accent="indigo" />
          </div>
          <StatusBar data={statusFromRows(orders.data, 'status')} />
        </TabsContent>
      </Tabs>
    </ModuleCard>
  )
}

// Build a status breakdown from raw rows (for tabs whose summary has no map).
function statusFromRows(rows: any[], field: string): { name: string; value: number }[] {
  const counts: Record<string, number> = {}
  rows?.forEach(r => {
    const k = r[field] || 'Unknown'
    counts[k] = (counts[k] || 0) + 1
  })
  return breakdownToData(counts)
}
