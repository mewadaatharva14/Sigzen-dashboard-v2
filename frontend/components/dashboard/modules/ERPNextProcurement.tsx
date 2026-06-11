'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { ShoppingCart, Truck, Clock, Building2, IndianRupee } from 'lucide-react'
import ModuleCard from '../ModuleCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useERPSession } from '@/lib/session-context'
import { getSessionPurchaseOrders, getSessionSuppliers } from '@/lib/erpnext-api'
import {
  ERPResponse, EMPTY_RESP, NotConnectedCard, EmptyState, StatTile,
  tooltipProps, statusColor, breakdownToData, fmtCurrency,
} from './erpnextShared'

function CountBar({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  if (data.length === 0) return <EmptyState message="No records found in ERPNext for this view." />
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} width={130} />
          <Tooltip {...tooltipProps} />
          <Bar dataKey="value" name={label} radius={[0, 6, 6, 0]}>
            {data.map((d, i) => <Cell key={i} fill={statusColor(d.name, i)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function ERPNextProcurement() {
  const { sessionId, isConnected, isLoading: sessionLoading } = useERPSession()
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState<ERPResponse>(EMPTY_RESP)
  const [suppliers, setSuppliers] = useState<ERPResponse>(EMPTY_RESP)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !sessionId) { setLoading(false); return }
    async function load() {
      setLoading(true)
      try {
        const [po, sup] = await Promise.all([
          getSessionPurchaseOrders(sessionId!), getSessionSuppliers(sessionId!),
        ])
        setOrders(po); setSuppliers(sup)
      } finally { setLoading(false) }
    }
    load()
  }, [sessionId, isConnected])

  if (!isConnected && !sessionLoading) return <NotConnectedCard title="Procurement (Live)" icon="ShoppingCart" />

  return (
    <ModuleCard
      title="Procurement (Live)"
      icon="ShoppingCart"
      insight="Live purchase orders, supplier spend and delivery status from ERPNext"
      exportData={tab === 'orders' ? orders.data : suppliers.data}
      exportFilename={`erpnext_procurement_${tab}`}
    >
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <TabsList className="bg-[#1e293b]/60 border border-slate-800 p-0.5 rounded-lg">
            <TabsTrigger value="orders" className="px-3 py-1.5 text-xs sm:text-sm">Purchase Orders</TabsTrigger>
            <TabsTrigger value="suppliers" className="px-3 py-1.5 text-xs sm:text-sm">Suppliers</TabsTrigger>
          </TabsList>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Fetching live data...</span>
            </div>
          )}
        </div>

        {/* PURCHASE ORDERS */}
        <TabsContent value="orders" className="mt-0 outline-none">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Total POs" value={orders.summary.total_count ?? 0} accent="blue" icon={<ShoppingCart className="w-5 h-5" />} />
            <StatTile label="Received" value={orders.summary.received_count ?? 0} accent="emerald" icon={<Truck className="w-5 h-5" />} />
            <StatTile label="Pending" value={orders.summary.pending_count ?? 0} accent="amber" icon={<Clock className="w-5 h-5" />} />
            <StatTile label="Total Value" value={fmtCurrency(orders.summary.total_value ?? 0)} accent="indigo" icon={<IndianRupee className="w-5 h-5" />} />
          </div>
          <CountBar data={statusFromRows(orders.data, 'status')} label="Purchase Orders" />
        </TabsContent>

        {/* SUPPLIERS */}
        <TabsContent value="suppliers" className="mt-0 outline-none">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatTile label="Total Suppliers" value={suppliers.summary.total_count ?? 0} accent="blue" icon={<Building2 className="w-5 h-5" />} />
            <StatTile label="Active" value={suppliers.summary.active_count ?? 0} accent="emerald" />
            <StatTile label="Supplier Groups" value={Object.keys(suppliers.summary.group_breakdown ?? {}).length} accent="indigo" />
          </div>
          <CountBar data={breakdownToData(suppliers.summary.group_breakdown)} label="Suppliers" />
        </TabsContent>
      </Tabs>
    </ModuleCard>
  )
}

function statusFromRows(rows: any[], field: string): { name: string; value: number }[] {
  const counts: Record<string, number> = {}
  rows?.forEach(r => {
    const k = r[field] || 'Unknown'
    counts[k] = (counts[k] || 0) + 1
  })
  return breakdownToData(counts)
}
