export interface DashboardMetrics {
  id: string
  total_revenue: number
  active_clients: number
  employee_utilization: number
  risk_alerts_count: number
  created_at: string
}

export interface FinancialData {
  id: string
  month: string
  revenue: number
  expenses: number
  profit: number
  created_at: string
}

export interface RevenueByService {
  id: string
  service_type: string
  amount: number
  month: string
  created_at: string
}

export interface ClientGrowthData {
  id: string
  month: string
  new_clients: number
  churned_clients: number
  active_clients: number
  created_at: string
}

export interface EmployeeEfficiencyData {
  id: string
  dept_name: string
  utilization_percentage: number
  total_employees: number
  created_at: string
}

export interface ProjectData {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'delayed' | 'on_hold'
  completion_percentage: number
  client: string
  created_at: string
}

export interface CustomerSatisfactionData {
  id: string
  nps_score: number
  support_tickets_resolved: number
  support_tickets_pending: number
  created_at: string
}

export interface RiskAlert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  dept_name: string
  action_required: string
  created_at: string
}

export interface PurchaseData {
  id: string
  vendor_category: string
  amount: number
  month: string
  created_at: string
}

export interface QualityMetrics {
  id: string
  sprint_number: number
  bugs_reported: number
  sprint_velocity: number
  created_at: string
}

export interface InventoryData {
  id: string
  asset_type: string
  quantity: number
  value: number
  created_at: string
}

export interface EcommerceMetrics {
  id: string
  month: string
  website_traffic: number
  leads_generated: number
  conversions: number
  created_at: string
}
