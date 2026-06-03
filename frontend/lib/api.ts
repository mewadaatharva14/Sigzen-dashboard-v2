import { supabase } from './supabase'

// ─── FINANCIAL HEALTH ───────────────────────────────────────
export async function getFinancialData() {
  try {
    const { data, error } = await supabase
      .from('financial_monthly')
      .select('*')
      .order('month', { ascending: true })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] Error fetching financial data:', error)
    return []
  }
}

// ─── REVENUE BY SERVICE ─────────────────────────────────────
export async function getRevenueByService() {
  try {
    const { data, error } = await supabase
      .from('revenue_by_service')
      .select('*')
      .order('month', { ascending: true })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] Error fetching revenue by service:', error)
    return []
  }
}

// ─── CLIENT GROWTH ──────────────────────────────────────────
export async function getClientGrowthData() {
  try {
    const { data, error } = await supabase
      .from('client_monthly_snapshot')
      .select('*')
      .order('month', { ascending: true })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] Error fetching client growth data:', error)
    return []
  }
}

// ─── EMPLOYEE EFFICIENCY ────────────────────────────────────
export async function getEmployeeEfficiencyData() {
  try {
    const { data, error } = await supabase
      .from('employee_monthly_metrics')
      .select(`
        *,
        employees (
          full_name,
          designation,
          department_id,
          departments (dept_name)
        )
      `)
      .order('month', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] Error fetching employee efficiency data:', error)
    return []
  }
}

// ─── DEPARTMENT UTILIZATION (for bar chart) ─────────────────
export async function getDepartmentUtilization() {
  try {
    const { data, error } = await supabase
      .from('employee_monthly_metrics')
      .select(`
        utilization_rate,
        employees (
          departments (dept_name)
        )
      `)
      .order('month', { ascending: false })
    if (error) throw error

    // Group by department and average utilization
    const deptMap: Record<string, number[]> = {}
    data?.forEach((row: any) => {
      const dept = row.employees?.departments?.dept_name || 'Unknown'
      if (!deptMap[dept]) deptMap[dept] = []
      deptMap[dept].push(Number(row.utilization_rate))
    })

    return Object.entries(deptMap).map(([dept, values]) => ({
      dept,
      utilization: Math.round(
        values.reduce((a, b) => a + b, 0) / values.length
      ),
    }))
  } catch (error) {
    console.error('[Supabase] Error fetching department utilization:', error)
    return []
  }
}

// ─── PROJECTS ───────────────────────────────────────────────
export async function getProjectData() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients (company_name, industry)
      `)
      .order('start_date', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] Error fetching project data:', error)
    return []
  }
}

// ─── PROJECT STATUS SUMMARY ─────────────────────────────────
export async function getProjectStatusSummary() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('status')
    if (error) throw error

    const summary = { Completed: 0, 'In Progress': 0, Delayed: 0, 'On Hold': 0 }
    data?.forEach((row: any) => {
      if (row.status in summary) {
        summary[row.status as keyof typeof summary]++
      }
    })
    return summary
  } catch (error) {
    console.error('[Supabase] Error fetching project status summary:', error)
    return { Completed: 0, 'In Progress': 0, Delayed: 0, 'On Hold': 0 }
  }
}

// ─── NPS SCORES ─────────────────────────────────────────────
export async function getNPSData() {
  try {
    const { data, error } = await supabase
      .from('nps_scores')
      .select('*')
      .order('survey_date', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] Error fetching NPS data:', error)
    return []
  }
}

// ─── SUPPORT TICKETS ────────────────────────────────────────
export async function getSupportTickets() {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
    if (error) throw error

    const resolved = data?.filter((t: any) => t.status === 'Resolved').length || 0
    const open = data?.filter((t: any) => t.status === 'Open').length || 0
    const overdue = data?.filter((t: any) =>
      t.status === 'Open' && t.priority === 'High'
    ).length || 0

    return { resolved, open, overdue, total: data?.length || 0 }
  } catch (error) {
    console.error('[Supabase] Error fetching support tickets:', error)
    return { resolved: 0, open: 0, overdue: 0, total: 0 }
  }
}

// ─── RISK ALERTS ────────────────────────────────────────────
export async function getRiskAlerts() {
  try {
    const { data, error } = await supabase
      .from('risk_alerts')
      .select('*')
      .order('alert_date', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] Error fetching risk alerts:', error)
    return []
  }
}

// ─── PURCHASE ORDERS ────────────────────────────────────────
export async function getPurchaseData() {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        vendors (vendor_name, category)
      `)
      .order('order_date', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] Error fetching purchase data:', error)
    return []
  }
}

// ─── QUALITY CONTROL ────────────────────────────────────────
export async function getQualityMetrics() {
  try {
    const { data, error } = await supabase
      .from('sprints')
      .select(`
        *,
        bug_reports (severity, status)
      `)
      .order('start_date', { ascending: true })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] Error fetching quality metrics:', error)
    return []
  }
}

// ─── INVENTORY ──────────────────────────────────────────────
export async function getInventoryData() {
  try {
    const [hardware, software] = await Promise.all([
      supabase.from('hardware_assets').select('*'),
      supabase.from('software_licenses').select(`
        *,
        vendors (vendor_name)
      `),
    ])
    return {
      hardware: hardware.data || [],
      software: software.data || [],
    }
  } catch (error) {
    console.error('[Supabase] Error fetching inventory data:', error)
    return { hardware: [], software: [] }
  }
}

// ─── WEBSITE / ECOMMERCE ────────────────────────────────────
export async function getEcommerceMetrics() {
  try {
    const { data, error } = await supabase
      .from('website_monthly_metrics')
      .select('*')
      .order('month', { ascending: true })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] Error fetching ecommerce metrics:', error)
    return []
  }
}

// ─── KPI SUMMARY (for top cards) ────────────────────────────
export async function getKPISummary() {
  try {
    const [financial, clients, employees, alerts] = await Promise.all([
      supabase
        .from('financial_monthly')
        .select('revenue, profit_margin_pct')
        .order('month', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('client_monthly_snapshot')
        .select('active_clients, new_clients')
        .order('month', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('employee_monthly_metrics')
        .select('utilization_rate')
        .order('month', { ascending: false })
        .limit(50),
      supabase
        .from('risk_alerts')
        .select('severity')
        .eq('status', 'Open'),
    ])

    const avgUtilization = employees.data
      ? Math.round(
          employees.data.reduce(
            (sum: number, e: any) => sum + Number(e.utilization_rate), 0
          ) / employees.data.length
        )
      : 0

    const criticalAlerts = alerts.data?.filter(
      (a: any) => a.severity?.toLowerCase() === 'critical'
    ).length || 0

    const highAlerts = alerts.data?.filter(
      (a: any) => a.severity?.toLowerCase() === 'high'
    ).length || 0

    return {
      revenue: financial.data?.revenue || 0,
      profitMargin: financial.data?.profit_margin_pct || 0,
      activeClients: clients.data?.active_clients || 0,
      newClients: clients.data?.new_clients || 0,
      avgUtilization,
      openAlerts: alerts.data?.length || 0,
      criticalAlerts,
      highAlerts,
    }
  } catch (error) {
    console.error('[Supabase] Error fetching KPI summary:', error)
    return null
  }
}