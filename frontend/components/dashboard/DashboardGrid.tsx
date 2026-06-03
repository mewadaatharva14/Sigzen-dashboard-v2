'use client'
import { useEffect, useState } from 'react'
import KPICard from './KPICard'
import FinancialHealth from './modules/FinancialHealth'
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
import { getKPISummary } from '@/lib/api'
import { useYear } from '@/lib/yearContext'

interface DashboardGridProps {
  visibleModules: Record<string, boolean>
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

export default function DashboardGrid({ visibleModules }: DashboardGridProps) {
  const [kpi, setKpi] = useState<any>(null)
  const [prevKpi, setPrevKpi] = useState<any>(null)
  const { selectedYear } = useYear()

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
      .catch(() => {})
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
      .catch(() => {})
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

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 pb-20">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {kpiData.map((item, idx) => (
          <KPICard key={idx} {...item} />
        ))}
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

        {visibleModules.financial_health && (
          <div className="col-span-1 md:col-span-2">
            <FinancialHealth />
          </div>
        )}

        {visibleModules.revenue_growth && <RevenueGrowth />}
        {visibleModules.customer_growth && <CustomerGrowth />}
        {visibleModules.employee_efficiency && <EmployeeEfficiency />}

        {visibleModules.project_delivery && (
          <div className="col-span-1 md:col-span-2">
            <ProjectDelivery />
          </div>
        )}

        {visibleModules.customer_satisfaction && <CustomerSatisfaction />}

        {visibleModules.risk_alerts && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <RiskAlerts />
          </div>
        )}

        {visibleModules.purchase_health && <PurchaseHealth />}
        {visibleModules.quality_control && <QualityControl />}
        {visibleModules.inventory_supply && <InventorySupply />}
        {visibleModules.ecommerce_analytics && <EcommerceAnalytics />}
      </div>
    </div>
  )
}