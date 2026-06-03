-- ============================================================================
-- Sigzen CEO Business Intelligence Dashboard - Supabase Schema
-- ============================================================================
-- Run this SQL in your Supabase project to create all necessary tables
-- Go to: SQL Editor > New Query and paste this entire file

-- Dashboard Metrics Summary
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0,
  active_clients INTEGER NOT NULL DEFAULT 0,
  employee_utilization NUMERIC(5, 2) NOT NULL DEFAULT 0,
  risk_alerts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Data (Revenue, Expenses, Profit by Month)
CREATE TABLE IF NOT EXISTS financial_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(10) NOT NULL,
  revenue NUMERIC(15, 2) NOT NULL,
  expenses NUMERIC(15, 2) NOT NULL,
  profit NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue by Service Type
CREATE TABLE IF NOT EXISTS revenue_by_service (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type VARCHAR(100) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  month VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Growth Data (New, Churned, Active Clients)
CREATE TABLE IF NOT EXISTS client_growth_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(10) NOT NULL,
  new_clients INTEGER NOT NULL DEFAULT 0,
  churned_clients INTEGER NOT NULL DEFAULT 0,
  active_clients INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee Efficiency by Department
CREATE TABLE IF NOT EXISTS employee_efficiency_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dept_name VARCHAR(100) NOT NULL,
  utilization_percentage NUMERIC(5, 2) NOT NULL,
  total_employees INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Data (Delivery Status)
CREATE TABLE IF NOT EXISTS project_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('completed', 'in_progress', 'delayed', 'on_hold')),
  completion_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  client VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Satisfaction (NPS and Support Tickets)
CREATE TABLE IF NOT EXISTS customer_satisfaction_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nps_score INTEGER NOT NULL CHECK (nps_score >= 0 AND nps_score <= 100),
  support_tickets_resolved INTEGER NOT NULL DEFAULT 0,
  support_tickets_pending INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk Alerts
CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  department VARCHAR(100) NOT NULL,
  action_required TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Data by Vendor Category
CREATE TABLE IF NOT EXISTS purchase_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_category VARCHAR(100) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  month VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Control Metrics
CREATE TABLE IF NOT EXISTS quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_number INTEGER NOT NULL,
  bugs_reported INTEGER NOT NULL DEFAULT 0,
  sprint_velocity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory & Supply Chain Data
CREATE TABLE IF NOT EXISTS inventory_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  value NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ecommerce Analytics
CREATE TABLE IF NOT EXISTS ecommerce_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(10) NOT NULL,
  website_traffic INTEGER NOT NULL DEFAULT 0,
  leads_generated INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SAMPLE DATA - Uncomment and run to populate test data
-- ============================================================================

-- Sample Dashboard Metrics
INSERT INTO dashboard_metrics (total_revenue, active_clients, employee_utilization, risk_alerts_count)
VALUES (105000000, 80, 84.2, 8)
ON CONFLICT DO NOTHING;

-- Sample Financial Data (Last 12 months)
INSERT INTO financial_data (month, revenue, expenses, profit) VALUES
('Jan 2024', 8500000, 5100000, 3400000),
('Feb 2024', 8800000, 5200000, 3600000),
('Mar 2024', 9100000, 5300000, 3800000),
('Apr 2024', 9400000, 5400000, 4000000),
('May 2024', 9700000, 5500000, 4200000),
('Jun 2024', 10000000, 5600000, 4400000),
('Jul 2024', 10300000, 5700000, 4600000),
('Aug 2024', 10600000, 5800000, 4800000),
('Sep 2024', 10900000, 5900000, 5000000),
('Oct 2024', 11200000, 6000000, 5200000),
('Nov 2024', 11500000, 6100000, 5400000),
('Dec 2024', 11800000, 6200000, 5600000)
ON CONFLICT DO NOTHING;

-- Sample Revenue by Service
INSERT INTO revenue_by_service (service_type, amount, month) VALUES
('License', 4500000, 'Dec 2024'),
('Implementation', 4200000, 'Dec 2024'),
('Support', 3100000, 'Dec 2024')
ON CONFLICT DO NOTHING;

-- Sample Client Growth Data
INSERT INTO client_growth_data (month, new_clients, churned_clients, active_clients) VALUES
('Jan 2024', 3, 1, 65),
('Feb 2024', 2, 1, 66),
('Mar 2024', 4, 0, 70),
('Apr 2024', 3, 1, 72),
('May 2024', 2, 0, 74),
('Jun 2024', 3, 1, 76),
('Jul 2024', 2, 0, 78),
('Aug 2024', 1, 1, 78),
('Sep 2024', 4, 0, 82),
('Oct 2024', 2, 1, 83),
('Nov 2024', 1, 0, 84),
('Dec 2024', 3, 0, 87)
ON CONFLICT DO NOTHING;

-- Sample Employee Efficiency Data
INSERT INTO employee_efficiency_data (department, utilization_percentage, total_employees) VALUES
('Implementation', 92.0, 45),
('Support', 78.5, 38),
('Sales', 85.3, 28),
('Operations', 71.2, 22),
('Engineering', 88.9, 55)
ON CONFLICT DO NOTHING;

-- Sample Project Data
INSERT INTO project_data (name, status, completion_percentage, client) VALUES
('ERP Migration - Sun Pharma', 'completed', 100, 'Sun Pharma'),
('CRM Implementation - Adani', 'in_progress', 75, 'Adani Group'),
('Supply Chain Optimization - HDFC', 'delayed', 60, 'HDFC Bank'),
('Dashboard Development - Reliance', 'in_progress', 85, 'Reliance'),
('Data Integration - TCS', 'on_hold', 45, 'Tata Consultancy Services')
ON CONFLICT DO NOTHING;

-- Sample Customer Satisfaction Data
INSERT INTO customer_satisfaction_data (nps_score, support_tickets_resolved, support_tickets_pending) VALUES
(62, 245, 12)
ON CONFLICT DO NOTHING;

-- Sample Risk Alerts
INSERT INTO risk_alerts (title, description, severity, department, action_required) VALUES
('Critical: Database Performance Degradation', 'Database queries taking >5 seconds, affecting user experience', 'critical', 'Engineering', 'Immediate database optimization required'),
('Critical: Q4 Revenue Target Miss', 'Current run rate shows 15% shortfall vs Q4 target', 'critical', 'Sales', 'Accelerate deal closure and explore upsell opportunities'),
('High: Delayed Project - Adani CRM', 'Project behind schedule by 2 weeks', 'high', 'Implementation', 'Resource reallocation and client communication'),
('High: Employee Utilization Alert', 'Implementation team at 92% utilization - burnout risk', 'high', 'HR', 'Hire contractors or redistribute workload'),
('Medium: Client Escalation - HDFC', 'Unresolved support ticket escalated', 'medium', 'Support', 'Assign senior engineer for resolution'),
('Medium: Vendor Payment Delay', 'License vendor payment 10 days overdue', 'medium', 'Finance', 'Process payment immediately'),
('Medium: Training Gap Identified', 'New team members lacking required certifications', 'medium', 'HR', 'Schedule immediate training sessions'),
('Low: Office Supplies Low Stock', 'Backup supplies running low', 'low', 'Operations', 'Reorder before next month')
ON CONFLICT DO NOTHING;

-- Sample Purchase Data
INSERT INTO purchase_data (vendor_category, amount, month) VALUES
('Software Licenses', 1200000, 'Dec 2024'),
('Infrastructure', 850000, 'Dec 2024'),
('Professional Services', 650000, 'Dec 2024'),
('Hardware', 450000, 'Dec 2024')
ON CONFLICT DO NOTHING;

-- Sample Quality Metrics
INSERT INTO quality_metrics (sprint_number, bugs_reported, sprint_velocity) VALUES
(42, 12, 45.5),
(43, 8, 48.2),
(44, 15, 42.8),
(45, 10, 50.1)
ON CONFLICT DO NOTHING;

-- Sample Inventory Data
INSERT INTO inventory_data (asset_type, quantity, value) VALUES
('Laptops', 45, 4500000),
('Monitors', 80, 960000),
('Servers', 12, 3600000),
('Networking Equipment', 25, 750000)
ON CONFLICT DO NOTHING;

-- Sample Ecommerce Metrics
INSERT INTO ecommerce_metrics (month, website_traffic, leads_generated, conversions) VALUES
('Oct 2024', 45000, 850, 127),
('Nov 2024', 52000, 950, 156),
('Dec 2024', 68000, 1250, 218)
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_financial_data_month ON financial_data(month);
CREATE INDEX IF NOT EXISTS idx_revenue_by_service_month ON revenue_by_service(month);
CREATE INDEX IF NOT EXISTS idx_client_growth_month ON client_growth_data(month);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity ON risk_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_project_data_status ON project_data(status);
CREATE INDEX IF NOT EXISTS idx_purchase_data_month ON purchase_data(month);
CREATE INDEX IF NOT EXISTS idx_ecommerce_metrics_month ON ecommerce_metrics(month);
