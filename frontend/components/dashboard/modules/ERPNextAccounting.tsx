'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import Link from 'next/link'
import { TrendingUp, FileText, DollarSign, CreditCard, AlertCircle, ArrowUpRight, ArrowDownRight, IndianRupee, HelpCircle, PlugZap } from 'lucide-react'
import ModuleCard from '../ModuleCard'
import { useYear } from '@/lib/yearContext'
import { useERPSession } from '@/lib/session-context'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { getSessionSalesInvoices, getSessionPurchaseInvoices, getSessionPayments, getSessionJournalEntries } from '@/lib/erpnext-api'

function formatYAxis(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

function formatTooltip(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  return `₹${value.toLocaleString('en-IN')}`
}

export default function ERPNextAccounting() {
  const { selectedYear } = useYear()
  const { sessionId, isConnected, isLoading: sessionLoading } = useERPSession()
  const [activeTab, setActiveTab] = useState('sales')

  // Data States
  const [salesData, setSalesData] = useState<any>({ data: [], summary: {}, source: 'offline' })
  const [purchaseData, setPurchaseData] = useState<any>({ data: [], summary: {}, source: 'offline' })
  const [paymentData, setPaymentData] = useState<any>({ data: [], summary: {}, source: 'offline' })
  const [journalData, setJournalData] = useState<any>({ data: [], summary: {}, source: 'offline' })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !sessionId) {
      setLoading(false)
      return
    }
    async function fetchData() {
      setLoading(true)
      try {
        const [sales, purchase, payments, journal] = await Promise.all([
          getSessionSalesInvoices(sessionId!, selectedYear),
          getSessionPurchaseInvoices(sessionId!, selectedYear),
          getSessionPayments(sessionId!, selectedYear),
          getSessionJournalEntries(sessionId!, selectedYear)
        ])
        setSalesData(sales)
        setPurchaseData(purchase)
        setPaymentData(payments)
        setJournalData(journal)
      } catch (err) {
        console.error("Error loading ERPNext Accounting data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedYear, sessionId, isConnected])

  // Not connected → show a "Connect your ERP" prompt (Supabase-only mode).
  if (!isConnected && !sessionLoading) {
    return (
      <ModuleCard
        title="ERPNext Accounting (Live)"
        icon="TrendingUp"
        insight="Connect an ERP system to see live accounting data."
      >
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <div className="p-3 bg-blue-500/10 rounded-full text-blue-400 mb-4">
            <PlugZap className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-1">No ERP Connected</h4>
          <p className="text-sm text-muted-foreground max-w-sm mb-5">
            Enter your ERP credentials to stream live billing, payables, and
            transactions directly into this dashboard.
          </p>
          <Link
            href="/connect"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
          >
            <PlugZap className="w-4 h-4" />
            Connect your ERP
          </Link>
        </div>
      </ModuleCard>
    )
  }

  const isOffline = 
    salesData.source === 'offline' && 
    purchaseData.source === 'offline' && 
    paymentData.source === 'offline' && 
    journalData.source === 'offline'

  if (isOffline && !loading) {
    return (
      <ModuleCard
        title="ERPNext Accounting (Live)"
        icon="TrendingUp"
        insight="ERPNext connection is currently offline or not configured."
      >
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500 mb-4 animate-pulse">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-1">ERPNext Live Connector Offline</h4>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            The dashboard is currently disconnected from your ERPNext instance. Check backend environment configuration.
          </p>
          <div className="text-xs px-3 py-1.5 bg-muted rounded-md text-slate-400">
            Falling back to Supabase historical datasets for general charts
          </div>
        </div>
      </ModuleCard>
    )
  }

  // Monthly grouping for charts
  const getSalesChartData = () => {
    const monthlyMap: Record<string, { month: string; total: number; collected: number; outstanding: number }> = {}
    salesData.data?.forEach((inv: any) => {
      const dateStr = inv.posting_date
      if (!dateStr) return
      const month = dateStr.substring(0, 7)
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, total: 0, collected: 0, outstanding: 0 }
      }
      const gt = Number(inv.grand_total || 0)
      const out = Number(inv.outstanding_amount || 0)
      monthlyMap[month].total += gt
      monthlyMap[month].outstanding += out
      monthlyMap[month].collected += (gt - out)
    })
    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month))
  }

  const getPurchaseChartData = () => {
    const monthlyMap: Record<string, { month: string; total: number; paid: number; outstanding: number }> = {}
    purchaseData.data?.forEach((inv: any) => {
      const dateStr = inv.posting_date
      if (!dateStr) return
      const month = dateStr.substring(0, 7)
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, total: 0, paid: 0, outstanding: 0 }
      }
      const gt = Number(inv.grand_total || 0)
      const out = Number(inv.outstanding_amount || 0)
      monthlyMap[month].total += gt
      monthlyMap[month].outstanding += out
      monthlyMap[month].paid += (gt - out)
    })
    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month))
  }

  const currentExportData = () => {
    if (activeTab === 'sales') return salesData.data
    if (activeTab === 'purchase') return purchaseData.data
    if (activeTab === 'payments') return paymentData.data
    return journalData.data
  }

  return (
    <ModuleCard
      title="ERPNext Accounting (Live)"
      icon="TrendingUp"
      insight={`Live billing, payables, and transactions for ${selectedYear}`}
      exportData={currentExportData()}
      exportFilename={`erpnext_accounting_${activeTab}_${selectedYear}`}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="bg-[#1e293b]/60 border border-slate-800 p-0.5 rounded-lg">
            <TabsTrigger value="sales" className="px-3 py-1.5 text-xs sm:text-sm">Sales Invoices</TabsTrigger>
            <TabsTrigger value="purchase" className="px-3 py-1.5 text-xs sm:text-sm">Purchase Invoices</TabsTrigger>
            <TabsTrigger value="payments" className="px-3 py-1.5 text-xs sm:text-sm">Payments</TabsTrigger>
            <TabsTrigger value="journal" className="px-3 py-1.5 text-xs sm:text-sm">Journal Entries</TabsTrigger>
          </TabsList>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Fetching live connector...</span>
            </div>
          )}
        </div>

        {/* ── SALES INVOICES TAB ────────────────────────────────────────── */}
        <TabsContent value="sales" className="mt-0 outline-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Invoiced</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {formatTooltip(salesData.summary?.total_value || 0)}
                </h4>
              </div>
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Collected</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {formatTooltip(salesData.summary?.collected_value || 0)}
                </h4>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Outstanding</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {formatTooltip(salesData.summary?.outstanding_value || 0)}
                </h4>
              </div>
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-lg">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Overdue Count</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {salesData.summary?.overdue_count || 0}
                </h4>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getSalesChartData()} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} tickFormatter={formatYAxis} width={65} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                  }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                  formatter={(value: any, name: string) => [formatTooltip(Number(value)), name]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Bar dataKey="total" fill="#3b82f6" name="Total Invoiced" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outstanding" fill="#ef4444" name="Outstanding" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* ── PURCHASE INVOICES TAB ────────────────────────────────────────── */}
        <TabsContent value="purchase" className="mt-0 outline-none">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Purchase Value</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {formatTooltip(purchaseData.summary?.total_value || 0)}
                </h4>
              </div>
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Paid Amount</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {formatTooltip(purchaseData.summary?.paid_value || 0)}
                </h4>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Outstanding Balance</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {formatTooltip(purchaseData.summary?.outstanding_value || 0)}
                </h4>
              </div>
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-lg">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getPurchaseChartData()} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} tickFormatter={formatYAxis} width={65} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                  }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                  formatter={(value: any, name: string) => [formatTooltip(Number(value)), name]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Bar dataKey="total" fill="#3b82f6" name="Total Bill" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outstanding" fill="#ef4444" name="Outstanding" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* ── PAYMENTS TAB ────────────────────────────────────────── */}
        <TabsContent value="payments" className="mt-0 outline-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Payments Received</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {formatTooltip(paymentData.summary?.total_received || 0)}
                </h4>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Expenses Paid</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {formatTooltip(paymentData.summary?.total_paid || 0)}
                </h4>
              </div>
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-lg">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paymentData.data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} tickFormatter={formatYAxis} width={65} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                  }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                  formatter={(value: any, name: string) => [formatTooltip(Number(value)), name]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={3} name="Total Received" activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="paid" stroke="#ef4444" strokeWidth={3} name="Total Paid" activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* ── JOURNAL ENTRIES TAB ────────────────────────────────────────── */}
        <TabsContent value="journal" className="mt-0 outline-none">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Entries</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {journalData.summary?.total_count || 0}
                </h4>
              </div>
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Debit Transactions</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {formatTooltip(journalData.summary?.total_debit || 0)}
                </h4>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Credit Transactions</p>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {formatTooltip(journalData.summary?.total_credit || 0)}
                </h4>
              </div>
              <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto border border-slate-800/80 rounded-xl bg-slate-950/20">
            <Table>
              <TableHeader className="bg-slate-900/60 sticky top-0 z-10">
                <TableRow className="border-b border-slate-800">
                  <TableHead className="text-slate-400 font-semibold text-xs py-3">Voucher ID</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs py-3">Posting Date</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs py-3">Voucher Type</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs py-3 text-right">Debit</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs py-3 text-right">Credit</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs py-3">Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journalData.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8 text-xs">
                      No journal entries found for this fiscal period
                    </TableCell>
                  </TableRow>
                ) : (
                  journalData.data?.map((entry: any, index: number) => (
                    <TableRow key={entry.name || index} className="border-b border-slate-800/50 hover:bg-slate-900/20">
                      <TableCell className="text-slate-200 font-medium text-xs py-2.5">{entry.name}</TableCell>
                      <TableCell className="text-slate-300 text-xs py-2.5">{entry.posting_date}</TableCell>
                      <TableCell className="text-slate-300 text-xs py-2.5">{entry.voucher_type}</TableCell>
                      <TableCell className="text-slate-300 text-xs text-right py-2.5">
                        {entry.total_debit > 0 ? `₹${Number(entry.total_debit).toLocaleString('en-IN')}` : '-'}
                      </TableCell>
                      <TableCell className="text-slate-300 text-xs text-right py-2.5">
                        {entry.total_credit > 0 ? `₹${Number(entry.total_credit).toLocaleString('en-IN')}` : '-'}
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs py-2.5 max-w-xs truncate" title={entry.remark}>
                        {entry.remark || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </ModuleCard>
  )
}
