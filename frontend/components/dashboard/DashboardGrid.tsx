'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Database, Zap, PlugZap, ArrowRight } from 'lucide-react'
import KPICard from './KPICard'
import FinancialHealth from './modules/FinancialHealth'
import ERPNextAccounting from './modules/ERPNextAccounting'
import ERPNextSalesCRM from './modules/ERPNextSalesCRM'
import ERPNextProcurement from './modules/ERPNextProcurement'
import ERPNextInventory from './modules/ERPNextInventory'
import ERPNextProjects from './modules/ERPNextProjects'
import ERPNextSupport from './modules/ERPNextSupport'
import RevenueGrowth from './modules/RevenueGrowth'
import CustomerGrowth from './modules/CustomerGrowth'
import EmployeeEfficiency from './modules/EmployeeEfficiency'
import ProjectDelivery from './modules/ProjectDelivery'
import CustomerSatisfaction from './modules/CustomerSatisfaction'
import RiskAlerts from './modules/RiskAlerts'
import PurchaseHealth from './modules/PurchaseHealth'
import QualityControl from './modules/QualityControl'
import InventorySupply from './modules/InventorySupply'
import EcommerceAnalytics from './modules/EcommerceAnalytics'
import ERPKpiRow from './ERPKpiRow'
import { getKPISummary } from '@/lib/api'
import { useYear } from '@/lib/yearContext'
import { useERPSession } from '@/lib/session-context'

interface DashboardGridProps {
  visibleModules: Record<string, boolean>
  viewMode: 'supabase' | 'erp'
}

// Small section heading used to visually separate the two data sources.
function SectionHeading({
  icon, title, subtitle, accent,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  accent: string
}) {
  return (
    <div className="flex items-center gap-3 mb-3 md:mb-4">
      <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="text-sm md:text-base font-bold text-foreground leading-tight truncate">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground leading-tight truncate">
          {subtitle}
        </p>
      </div>
      <div className="flex-1 h-px bg-border ml-2" />
    </div>
  )
}

function formatRevenue(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  return `₹${value}`
}

function calcTrend(current: number, previous: number): string {
  if (!previous || previous === 0) return ''
  const pct = ((current - previous) / previous) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs ${new Date().getFullYear() - 1}`
}

export default function DashboardGrid({ visibleModules, viewMode }: DashboardGridProps) {
  const [kpi, setKpi] = useState<any>(null)
  const [prevKpi, setPrevKpi] = useState<any>(null)
  const { selectedYear, setSelectedYear, supabaseYears, erpnextYears } = useYear()
  const { isConnected } = useERPSession()

  // Keep the selected year valid for the active data source so modules
  // aren't blank after switching mode.
  useEffect(() => {
    const years = viewMode === 'erp' ? erpnextYears : supabaseYears
    if (years.length === 0) return
    if (!years.includes(selectedYear)) {
      const latest = [...years].sort((a, b) => b - a)[0]
      if (latest && latest !== selectedYear) setSelectedYear(latest)
    }
  }, [viewMode, selectedYear, supabaseYears, erpnextYears, setSelectedYear])

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    // Current year KPI
    getKPISummary().then(setKpi)

    // Previous year financial for trend
    const prevYear = selectedYear - 1
    fetch(`${apiUrl}/api/financial/${prevYear}`)
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data.length > 0) {
          const totalRevenue = json.data.reduce(
            (sum: number, row: any) => sum + Number(row.revenue || 0), 0
          )
          setPrevKpi({ revenue: totalRevenue })
        }
      })
      .catch(() => { })
  }, [selectedYear])

  // Current year total revenue
  const [currentRevenue, setCurrentRevenue] = useState<number>(0)
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${apiUrl}/api/financial/${selectedYear}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          const total = json.data.reduce(
            (sum: number, row: any) => sum + Number(row.revenue || 0), 0
          )
          setCurrentRevenue(total)
        }
      })
      .catch(() => { })
  }, [selectedYear])

  const revenueTrend = prevKpi?.revenue
    ? calcTrend(currentRevenue, prevKpi.revenue)
    : kpi ? `${kpi.profitMargin?.toFixed(1)}% margin` : '+12.4%'

  const kpiData = [
    {
      title: 'Total Revenue',
      value: currentRevenue > 0
        ? formatRevenue(currentRevenue)
        : kpi ? formatRevenue(kpi.revenue) : '₹10.5 Cr',
      change: revenueTrend,
      subtitle: `${selectedYear} full year`,
      color: 'from-emerald-500 to-teal-500',
      icon: 'TrendingUp',
    },
    {
      title: 'Active Clients',
      value: kpi ? String(kpi.activeClients) : '75',
      change: kpi ? `+${kpi.newClients} new` : '+2',
      subtitle: 'this month',
      color: 'from-blue-500 to-cyan-500',
      icon: 'Users',
    },
    {
      title: 'Employee Utilization',
      value: kpi ? `${kpi.avgUtilization}%` : '84%',
      change: kpi && kpi.avgUtilization >= 80
        ? 'Above target ✓'
        : 'Below target',
      subtitle: '80% target',
      color: 'from-purple-500 to-pink-500',
      icon: 'Activity',
    },
    {
      title: 'Open Risk Alerts',
      value: kpi ? String(kpi.openAlerts) : '30',
      change: kpi ? `${kpi.criticalAlerts} Critical` : '0 Critical',
      subtitle: kpi ? `${kpi.highAlerts} High severity` : '9 High severity',
      color: 'from-red-500 to-orange-500',
      icon: 'AlertTriangle',
    },
  ]

  const anyErpVisible = [
    'erpnext_accounting', 'erpnext_sales_crm', 'erpnext_procurement',
    'erpnext_inventory', 'erpnext_projects', 'erpnext_support',
  ].some(k => visibleModules[k])

  // ── SUPABASE VIEW ────────────────────────────────────────────────
  if (viewMode === 'supabase') {
    return (
      <div className="space-y-6 md:space-y-8 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {kpiData.map((item, idx) => <KPICard key={idx} {...item} />)}
        </div>

        <section>
          <SectionHeading
            icon={<Database className="w-5 h-5 text-sky-400" />}
            title="Historical Data"
            subtitle="Supabase · business intelligence datasets"
            accent="bg-sky-500/10"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {visibleModules.financial_health && (
              <div className="col-span-1 md:col-span-2"><FinancialHealth /></div>
            )}
            {visibleModules.revenue_growth && <RevenueGrowth />}
            {visibleModules.customer_growth && <CustomerGrowth />}
            {visibleModules.employee_efficiency && <EmployeeEfficiency />}
            {visibleModules.project_delivery && (
              <div className="col-span-1 md:col-span-2"><ProjectDelivery /></div>
            )}
            {visibleModules.customer_satisfaction && <CustomerSatisfaction />}
            {visibleModules.risk_alerts && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3"><RiskAlerts /></div>
            )}
            {visibleModules.purchase_health && <PurchaseHealth />}
            {visibleModules.quality_control && <QualityControl />}
            {visibleModules.inventory_supply && <InventorySupply />}
            {visibleModules.ecommerce_analytics && <EcommerceAnalytics />}
          </div>
        </section>
      </div>
    )
  }

  // ── ERP VIEW ─────────────────────────────────────────────────────
  // Not connected → friendly prompt to enter credentials.
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center pt-10 pb-20">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-8 md:p-10 shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-5">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Connect your ERP</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You&apos;re viewing the <span className="text-emerald-400 font-medium">Live ERP</span> dashboard,
            but no ERP is connected yet. Enter your credentials to stream live accounting,
            sales, inventory, projects and more — straight into this page.
          </p>
          <Link
            href="/connect"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
          >
            <PlugZap className="w-4 h-4" />
            Connect your ERP
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-5">
            Prefer historical data? Switch to <span className="text-sky-400 font-medium">Supabase</span> using the toggle above.
          </p>
        </div>
      </div>
    )
  }

  // Connected → ERP KPIs + ERP modules.
  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <ERPKpiRow />
      <section>
        <SectionHeading
          icon={<Zap className="w-5 h-5 text-emerald-400" />}
          title="Live ERP Data"
          subtitle="ERPNext · real-time operations across modules"
          accent="bg-emerald-500/10"
        />
        {anyErpVisible ? (
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {visibleModules.erpnext_accounting && <ERPNextAccounting />}
            {visibleModules.erpnext_sales_crm && <ERPNextSalesCRM />}
            {visibleModules.erpnext_procurement && <ERPNextProcurement />}
            {visibleModules.erpnext_inventory && <ERPNextInventory />}
            {visibleModules.erpnext_projects && <ERPNextProjects />}
            {visibleModules.erpnext_support && <ERPNextSupport />}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            All ERP modules are hidden. Enable them in Customize.
          </p>
        )}
      </section>
    </div>
  )
}