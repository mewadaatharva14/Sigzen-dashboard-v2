'use client'
import { useEffect, useState } from 'react'
import KPICard from './KPICard'
import { useYear } from '@/lib/yearContext'
import { useERPSession } from '@/lib/session-context'
import {
  getSessionSalesInvoices, getSessionSuppliers, getSessionTasks,
} from '@/lib/erpnext-api'
import { fmtCurrency } from './modules/erpnextShared'

// Top KPI row shown in ERP mode — live figures pulled from the connected ERP.
export default function ERPKpiRow() {
  const { sessionId, isConnected } = useERPSession()
  const { selectedYear } = useYear()
  const [kpi, setKpi] = useState({
    invoiced: 0, outstanding: 0, invoiceCount: 0,
    suppliers: 0, activeSuppliers: 0,
    tasks: 0, openTasks: 0,
  })

  useEffect(() => {
    if (!isConnected || !sessionId) return
    let active = true
    async function load() {
      const [inv, sup, tsk] = await Promise.all([
        getSessionSalesInvoices(sessionId!, selectedYear),
        getSessionSuppliers(sessionId!),
        getSessionTasks(sessionId!),
      ])
      if (!active) return
      setKpi({
        invoiced: inv.summary?.total_value ?? 0,
        outstanding: inv.summary?.outstanding_value ?? 0,
        invoiceCount: inv.summary?.total_count ?? 0,
        suppliers: sup.summary?.total_count ?? 0,
        activeSuppliers: sup.summary?.active_count ?? 0,
        tasks: tsk.summary?.total_count ?? 0,
        openTasks: tsk.summary?.open_count ?? 0,
      })
    }
    load()
    return () => { active = false }
  }, [sessionId, isConnected, selectedYear])

  const cards = [
    {
      title: 'Total Invoiced',
      value: fmtCurrency(kpi.invoiced),
      change: `${kpi.invoiceCount} invoices`,
      subtitle: `${selectedYear} sales invoices`,
      color: 'from-emerald-500 to-teal-500',
      icon: 'TrendingUp',
    },
    {
      title: 'Outstanding',
      value: fmtCurrency(kpi.outstanding),
      change: kpi.invoiced > 0 ? `${Math.round(kpi.outstanding / kpi.invoiced * 100)}% of invoiced` : '—',
      subtitle: 'receivables pending',
      color: 'from-red-500 to-orange-500',
      icon: 'AlertTriangle',
    },
    {
      title: 'Active Suppliers',
      value: String(kpi.activeSuppliers),
      change: `${kpi.suppliers} total`,
      subtitle: 'procurement network',
      color: 'from-blue-500 to-cyan-500',
      icon: 'Users',
    },
    {
      title: 'Open Tasks',
      value: String(kpi.openTasks),
      change: `${kpi.tasks} total tasks`,
      subtitle: 'project workload',
      color: 'from-purple-500 to-pink-500',
      icon: 'Activity',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {cards.map((c, i) => <KPICard key={i} {...c} />)}
    </div>
  )
}
