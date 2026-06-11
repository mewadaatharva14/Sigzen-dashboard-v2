'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Package, AlertTriangle, IndianRupee, Truck, Boxes } from 'lucide-react'
import ModuleCard from '../ModuleCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { useERPSession } from '@/lib/session-context'
import { getSessionStock, getSessionDeliveryNotes, getSessionPurchaseReceipts } from '@/lib/erpnext-api'
import {
  ERPResponse, EMPTY_RESP, NotConnectedCard, EmptyState, StatTile,
  tooltipProps, fmtCurrency,
} from './erpnextShared'

function MonthlyValueChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <EmptyState message="No records found in ERPNext for this view." />
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} width={60}
            tickFormatter={(v: number) => fmtCurrency(v)} />
          <Tooltip {...tooltipProps} formatter={(v: any) => [fmtCurrency(Number(v)), 'Value']} />
          <Bar dataKey="value" name="Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function ERPNextInventory() {
  const { sessionId, isConnected, isLoading: sessionLoading } = useERPSession()
  const [tab, setTab] = useState('stock')
  const [stock, setStock] = useState<ERPResponse>(EMPTY_RESP)
  const [deliveries, setDeliveries] = useState<ERPResponse>(EMPTY_RESP)
  const [receipts, setReceipts] = useState<ERPResponse>(EMPTY_RESP)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !sessionId) { setLoading(false); return }
    async function load() {
      setLoading(true)
      try {
        const [st, dn, pr] = await Promise.all([
          getSessionStock(sessionId!), getSessionDeliveryNotes(sessionId!), getSessionPurchaseReceipts(sessionId!),
        ])
        setStock(st); setDeliveries(dn); setReceipts(pr)
      } finally { setLoading(false) }
    }
    load()
  }, [sessionId, isConnected])

  if (!isConnected && !sessionLoading) return <NotConnectedCard title="Inventory & Stock (Live)" icon="Package" />

  const exportData = tab === 'stock' ? stock.data : tab === 'delivery' ? deliveries.data : receipts.data

  return (
    <ModuleCard
      title="Inventory & Stock (Live)"
      icon="Package"
      insight="Live stock levels, low-stock alerts, deliveries and receipts from ERPNext"
      exportData={exportData}
      exportFilename={`erpnext_inventory_${tab}`}
    >
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <TabsList className="bg-[#1e293b]/60 border border-slate-800 p-0.5 rounded-lg">
            <TabsTrigger value="stock" className="px-3 py-1.5 text-xs sm:text-sm">Stock Levels</TabsTrigger>
            <TabsTrigger value="delivery" className="px-3 py-1.5 text-xs sm:text-sm">Delivery Notes</TabsTrigger>
            <TabsTrigger value="receipts" className="px-3 py-1.5 text-xs sm:text-sm">Purchase Receipts</TabsTrigger>
          </TabsList>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Fetching live data...</span>
            </div>
          )}
        </div>

        {/* STOCK */}
        <TabsContent value="stock" className="mt-0 outline-none">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Total Items" value={stock.summary.total_items ?? 0} accent="blue" icon={<Boxes className="w-5 h-5" />} />
            <StatTile label="Low Stock" value={stock.summary.low_stock_count ?? 0} accent="rose" icon={<AlertTriangle className="w-5 h-5" />} />
            <StatTile label="Total Qty" value={Math.round(stock.summary.total_qty ?? 0).toLocaleString('en-IN')} accent="indigo" icon={<Package className="w-5 h-5" />} />
            <StatTile label="Stock Value" value={fmtCurrency(stock.summary.total_value ?? 0)} accent="emerald" icon={<IndianRupee className="w-5 h-5" />} />
          </div>
          {stock.data?.length === 0 ? (
            <EmptyState message="No stock records found in ERPNext." />
          ) : (
            <div className="max-h-72 overflow-y-auto border border-slate-800/80 rounded-xl bg-slate-950/20">
              <Table>
                <TableHeader className="bg-slate-900/60 sticky top-0 z-10">
                  <TableRow className="border-b border-slate-800">
                    <TableHead className="text-slate-400 font-semibold text-xs py-3">Item</TableHead>
                    <TableHead className="text-slate-400 font-semibold text-xs py-3">Warehouse</TableHead>
                    <TableHead className="text-slate-400 font-semibold text-xs py-3 text-right">Qty</TableHead>
                    <TableHead className="text-slate-400 font-semibold text-xs py-3 text-right">Value</TableHead>
                    <TableHead className="text-slate-400 font-semibold text-xs py-3 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.data.map((item: any, i: number) => (
                    <TableRow key={i} className="border-b border-slate-800/50 hover:bg-slate-900/20">
                      <TableCell className="text-slate-200 font-medium text-xs py-2.5">{item.item_code}</TableCell>
                      <TableCell className="text-slate-300 text-xs py-2.5">{item.warehouse}</TableCell>
                      <TableCell className="text-slate-300 text-xs text-right py-2.5">{Number(item.actual_qty || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-slate-300 text-xs text-right py-2.5">{fmtCurrency(Number(item.stock_value || 0))}</TableCell>
                      <TableCell className="text-center py-2.5">
                        {item.low_stock
                          ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">Low</span>
                          : <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">OK</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* DELIVERY NOTES */}
        <TabsContent value="delivery" className="mt-0 outline-none">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatTile label="Total Delivery Notes" value={deliveries.summary.total_count ?? 0} accent="blue" icon={<Truck className="w-5 h-5" />} />
            <StatTile label="Total Value" value={fmtCurrency(deliveries.summary.total_value ?? 0)} accent="emerald" icon={<IndianRupee className="w-5 h-5" />} />
          </div>
          <MonthlyValueChart data={deliveries.data} />
        </TabsContent>

        {/* PURCHASE RECEIPTS */}
        <TabsContent value="receipts" className="mt-0 outline-none">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatTile label="Total Receipts" value={receipts.summary.total_count ?? 0} accent="blue" icon={<Package className="w-5 h-5" />} />
            <StatTile label="Total Value" value={fmtCurrency(receipts.summary.total_value ?? 0)} accent="emerald" icon={<IndianRupee className="w-5 h-5" />} />
          </div>
          <MonthlyValueChart data={receipts.data} />
        </TabsContent>
      </Tabs>
    </ModuleCard>
  )
}
