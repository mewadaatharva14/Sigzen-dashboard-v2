

-- ============================================================
-- SIGZEN TECHNOLOGIES — CEO-LEVEL BI DASHBOARD
-- PostgreSQL / Supabase Compatible SQL
-- Covers: All 11 Modules | Jan 2023 – Dec 2024
-- ============================================================

-- ============================================================
-- MODULE 1: FINANCIAL HEALTH
-- ============================================================

CREATE TABLE financial_monthly (
    id                  SERIAL PRIMARY KEY,
    month               DATE NOT NULL,                  -- First day of each month
    revenue             NUMERIC(15,2) NOT NULL,
    expenses            NUMERIC(15,2) NOT NULL,
    gross_profit        NUMERIC(15,2) GENERATED ALWAYS AS (revenue - expenses) STORED,
    profit_margin_pct   NUMERIC(6,2),                   -- %
    cash_inflow         NUMERIC(15,2) NOT NULL,
    cash_outflow        NUMERIC(15,2) NOT NULL,
    net_cash_flow       NUMERIC(15,2) GENERATED ALWAYS AS (cash_inflow - cash_outflow) STORED,
    ebitda              NUMERIC(15,2),
    notes               TEXT
);

-- MODULE 2: REVENUE GROWTH BY SERVICE TYPE

CREATE TABLE revenue_by_service (
    id              SERIAL PRIMARY KEY,
    month           DATE NOT NULL,
    service_type    VARCHAR(50) NOT NULL,   -- 'ERP License', 'Implementation', 'Support'
    revenue         NUMERIC(15,2) NOT NULL,
    num_deals       INTEGER DEFAULT 0,
    avg_deal_size   NUMERIC(15,2)
);

-- ============================================================
-- MODULE 3: CUSTOMER GROWTH
-- ============================================================

CREATE TABLE clients (
    id                  SERIAL PRIMARY KEY,
    company_name        VARCHAR(150) NOT NULL,
    industry            VARCHAR(80) NOT NULL,
    city                VARCHAR(80),
    state               VARCHAR(80),
    onboarding_date     DATE NOT NULL,
    contract_value      NUMERIC(15,2) NOT NULL,         -- Annual contract value INR
    contract_type       VARCHAR(30),                    -- 'Annual', 'Multi-year'
    status              VARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active','Churned','New'
    churn_date          DATE,
    account_manager     VARCHAR(100),
    industry_segment    VARCHAR(50)                     -- SME, Mid-market, Enterprise
);

CREATE TABLE client_monthly_snapshot (
    id              SERIAL PRIMARY KEY,
    month           DATE NOT NULL,
    new_clients     INTEGER DEFAULT 0,
    churned_clients INTEGER DEFAULT 0,
    active_clients  INTEGER DEFAULT 0,
    total_arr       NUMERIC(15,2)           -- Annual Recurring Revenue
);

-- ============================================================
-- MODULE 4: EMPLOYEE EFFICIENCY
-- ============================================================

CREATE TABLE departments (
    id              SERIAL PRIMARY KEY,
    dept_name       VARCHAR(80) NOT NULL,
    dept_head       VARCHAR(100),
    cost_center     VARCHAR(20),
    location        VARCHAR(80)
);

CREATE TABLE employees (
    id                  SERIAL PRIMARY KEY,
    full_name           VARCHAR(100) NOT NULL,
    emp_code            VARCHAR(20) UNIQUE NOT NULL,
    department_id       INTEGER REFERENCES departments(id),
    designation         VARCHAR(80),
    date_of_joining     DATE NOT NULL,
    date_of_leaving     DATE,
    employment_status   VARCHAR(20) DEFAULT 'Active',   -- 'Active','Resigned','Terminated'
    monthly_ctc         NUMERIC(12,2),                  -- INR
    is_billable         BOOLEAN DEFAULT TRUE,
    city                VARCHAR(60),
    email               VARCHAR(120)
);

CREATE TABLE employee_monthly_metrics (
    id                  SERIAL PRIMARY KEY,
    month               DATE NOT NULL,
    employee_id         INTEGER REFERENCES employees(id),
    billable_hours      NUMERIC(6,2),
    total_hours         NUMERIC(6,2) DEFAULT 176,       -- ~22 working days
    utilization_rate    NUMERIC(5,2),                   -- %
    leaves_taken        INTEGER DEFAULT 0,
    overtime_hours      NUMERIC(6,2) DEFAULT 0
);

-- ============================================================
-- MODULE 5: PROJECT / PRODUCT DELIVERY
-- ============================================================

CREATE TABLE projects (
    id                  SERIAL PRIMARY KEY,
    project_name        VARCHAR(150) NOT NULL,
    client_id           INTEGER REFERENCES clients(id),
    project_type        VARCHAR(60),    -- 'ERP Implementation','Module Add-on','Migration','Support Retainer'
    project_manager_id  INTEGER REFERENCES employees(id),
    start_date          DATE NOT NULL,
    expected_end_date   DATE NOT NULL,
    actual_end_date     DATE,
    status              VARCHAR(20) NOT NULL,  -- 'On-track','At-risk','Delayed','Completed'
    budget_inr          NUMERIC(15,2),
    actual_cost_inr     NUMERIC(15,2),
    completion_pct      INTEGER DEFAULT 0,
    modules_in_scope    TEXT,
    notes               TEXT
);

CREATE TABLE project_milestones (
    id              SERIAL PRIMARY KEY,
    project_id      INTEGER REFERENCES projects(id),
    milestone_name  VARCHAR(100),
    due_date        DATE,
    completed_date  DATE,
    status          VARCHAR(20)  -- 'Pending','Done','Missed'
);

-- ============================================================
-- MODULE 6: CUSTOMER SATISFACTION
-- ============================================================

CREATE TABLE nps_scores (
    id              SERIAL PRIMARY KEY,
    client_id       INTEGER REFERENCES clients(id),
    survey_quarter  VARCHAR(10) NOT NULL,   -- 'Q1-2023', 'Q2-2023' ...
    survey_date     DATE,
    nps_score       INTEGER CHECK (nps_score BETWEEN -100 AND 100),
    promoters_pct   NUMERIC(5,2),
    detractors_pct  NUMERIC(5,2),
    passives_pct    NUMERIC(5,2),
    feedback_notes  TEXT
);

CREATE TABLE support_tickets (
    id                  SERIAL PRIMARY KEY,
    client_id           INTEGER REFERENCES clients(id),
    ticket_number       VARCHAR(20) UNIQUE NOT NULL,
    raised_date         DATE NOT NULL,
    closed_date         DATE,
    category            VARCHAR(60),    -- 'Bug','Feature Request','Training','Integration','Performance'
    priority            VARCHAR(20),    -- 'Critical','High','Medium','Low'
    status              VARCHAR(20),    -- 'Open','In Progress','Resolved','Closed'
    resolution_hours    NUMERIC(7,2),
    assigned_to_id      INTEGER REFERENCES employees(id),
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5)
);

-- ============================================================
-- MODULE 7: RISK ALERTS
-- ============================================================

CREATE TABLE risk_alerts (
    id              SERIAL PRIMARY KEY,
    alert_date      DATE NOT NULL,
    alert_type      VARCHAR(60) NOT NULL,   -- 'Overdue Payment','Delayed Project','Churn Risk','SLA Breach'
    severity        VARCHAR(20) NOT NULL,   -- 'High','Medium','Low'
    client_id       INTEGER REFERENCES clients(id),
    project_id      INTEGER REFERENCES projects(id),
    description     TEXT,
    amount_at_risk  NUMERIC(15,2),
    status          VARCHAR(20) DEFAULT 'Open',  -- 'Open','Resolved','Escalated'
    resolved_date   DATE,
    assigned_to     VARCHAR(100)
);

-- ============================================================
-- MODULE 8: PURCHASE HEALTH
-- ============================================================

CREATE TABLE vendors (
    id              SERIAL PRIMARY KEY,
    vendor_name     VARCHAR(150) NOT NULL,
    category        VARCHAR(80),    -- 'Cloud Infrastructure','Software License','Office Supplies','HR Services'
    gstin           VARCHAR(20),
    payment_terms   VARCHAR(30),    -- 'Net 30','Net 45','Advance'
    city            VARCHAR(60),
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE purchase_orders (
    id              SERIAL PRIMARY KEY,
    po_number       VARCHAR(30) UNIQUE NOT NULL,
    vendor_id       INTEGER REFERENCES vendors(id),
    order_date      DATE NOT NULL,
    expected_delivery DATE,
    actual_delivery DATE,
    po_amount       NUMERIC(15,2) NOT NULL,
    paid_amount     NUMERIC(15,2) DEFAULT 0,
    payment_status  VARCHAR(30),    -- 'Paid','Partial','Unpaid','Overdue'
    category        VARCHAR(60),
    description     TEXT
);

-- ============================================================
-- MODULE 9: QUALITY CONTROL
-- ============================================================

CREATE TABLE sprints (
    id              SERIAL PRIMARY KEY,
    sprint_name     VARCHAR(80) NOT NULL,
    project_id      INTEGER REFERENCES projects(id),
    start_date      DATE,
    end_date        DATE,
    planned_points  INTEGER,
    completed_points INTEGER,
    velocity        NUMERIC(6,2),   -- story points per day
    team_size       INTEGER,
    sprint_goal     TEXT
);

CREATE TABLE bug_reports (
    id              SERIAL PRIMARY KEY,
    reported_date   DATE NOT NULL,
    project_id      INTEGER REFERENCES projects(id),
    bug_severity    VARCHAR(20),    -- 'Critical','Major','Minor','Trivial'
    bug_status      VARCHAR(20),    -- 'Open','Fixed','Verified','Closed','Reopened'
    module_affected VARCHAR(80),
    reported_by_id  INTEGER REFERENCES employees(id),
    assigned_to_id  INTEGER REFERENCES employees(id),
    resolution_days INTEGER,
    environment     VARCHAR(30)     -- 'Dev','QA','UAT','Production'
);

CREATE TABLE release_quality (
    id              SERIAL PRIMARY KEY,
    release_version VARCHAR(20),
    release_date    DATE NOT NULL,
    quality_score   NUMERIC(4,1),   -- 1–10
    bugs_pre_release INTEGER,
    bugs_post_release INTEGER,
    test_coverage_pct NUMERIC(5,2),
    rollback_required BOOLEAN DEFAULT FALSE,
    notes           TEXT
);

-- ============================================================
-- MODULE 10: INVENTORY & SUPPLY CHAIN
-- ============================================================

CREATE TABLE software_licenses (
    id                  SERIAL PRIMARY KEY,
    license_name        VARCHAR(100) NOT NULL,
    vendor_id           INTEGER REFERENCES vendors(id),
    license_type        VARCHAR(60),    -- 'SaaS','Perpetual','Subscription'
    seats_purchased     INTEGER,
    seats_used          INTEGER,
    cost_per_seat_inr   NUMERIC(10,2),
    total_cost_inr      NUMERIC(15,2),
    purchase_date       DATE,
    expiry_date         DATE,
    renewal_status      VARCHAR(30)     -- 'Active','Expiring Soon','Expired','Renewed'
);

CREATE TABLE hardware_assets (
    id              SERIAL PRIMARY KEY,
    asset_name      VARCHAR(100) NOT NULL,
    asset_type      VARCHAR(60),    -- 'Laptop','Server','Monitor','Networking'
    assigned_to_id  INTEGER REFERENCES employees(id),
    purchase_date   DATE,
    purchase_cost   NUMERIC(12,2),
    current_value   NUMERIC(12,2),
    status          VARCHAR(30),    -- 'In Use','In Stock','Under Repair','Retired'
    serial_number   VARCHAR(60),
    warranty_expiry DATE
);

-- ============================================================
-- MODULE 11: WEBSITE / eCOMMERCE
-- ============================================================

CREATE TABLE website_monthly_metrics (
    id                      SERIAL PRIMARY KEY,
    month                   DATE NOT NULL,
    total_sessions          INTEGER,
    unique_visitors         INTEGER,
    page_views              INTEGER,
    avg_session_duration_sec INTEGER,
    bounce_rate_pct         NUMERIC(5,2),
    organic_traffic         INTEGER,
    paid_traffic            INTEGER,
    referral_traffic        INTEGER,
    leads_generated         INTEGER,
    demo_requests           INTEGER,
    trial_signups           INTEGER,
    paid_conversions        INTEGER,
    conversion_rate_pct     NUMERIC(5,2),
    revenue_from_online     NUMERIC(15,2),
    top_traffic_source      VARCHAR(60)
);

-- ============================================================
-- ============================================================
-- INSERT DATA — MODULE 1: FINANCIAL HEALTH (24 months)
-- ============================================================

INSERT INTO financial_monthly (month, revenue, expenses, profit_margin_pct, cash_inflow, cash_outflow, ebitda, notes) VALUES
-- 2023
('2023-01-01', 8200000,  5900000,  28.05, 7800000,  6100000,  2300000, 'Slow Jan start, pipeline building'),
('2023-02-01', 8750000,  6100000,  30.29, 8200000,  6300000,  2650000, 'Two new implementations kicked off'),
('2023-03-01', 9400000,  6300000,  32.98, 9100000,  6400000,  3100000, 'Q1 close, license renewals came in'),
('2023-04-01', 8900000,  6500000,  26.97, 8600000,  6600000,  2400000, 'Hiring spree increased payroll'),
('2023-05-01', 9100000,  6400000,  29.67, 8800000,  6500000,  2700000, 'Steady month, support contracts renewed'),
('2023-06-01', 10200000, 6700000,  34.31, 9800000,  6800000,  3500000, 'Mid-year push, 3 new clients signed'),
('2023-07-01', 9600000,  6900000,  28.13, 9200000,  7000000,  2700000, 'July dip, holiday season effect'),
('2023-08-01', 9800000,  6800000,  30.61, 9500000,  6900000,  3000000, 'Recovery, one large implementation'),
('2023-09-01', 10500000, 7100000,  32.38, 10100000, 7200000,  3400000, 'Q3 close, strong sales month'),
('2023-10-01', 10100000, 7300000,  27.72, 9700000,  7400000,  2800000, 'Expenses up due to training programs'),
('2023-11-01', 10800000, 7200000,  33.33, 10400000, 7300000,  3600000, 'Pre-Diwali enterprise deals closed'),
('2023-12-01', 11500000, 7500000,  34.78, 11200000, 7600000,  4000000, 'Year-end push, bonuses paid out'),
-- 2024
('2024-01-01', 9800000,  7200000,  26.53, 9300000,  7500000,  2600000, 'Jan slowdown post year-end'),
('2024-02-01', 10300000, 7300000,  29.13, 9900000,  7400000,  3000000, 'Renewal season, Q1 pipeline active'),
('2024-03-01', 11200000, 7600000,  32.14, 10800000, 7700000,  3600000, 'FY close for clients, spike in licenses'),
('2024-04-01', 10600000, 7800000,  26.42, 10200000, 8000000,  2800000, 'New FY, budgets reset, slower start'),
('2024-05-01', 11000000, 7700000,  30.00, 10600000, 7800000,  3300000, 'Healthcare vertical expansion'),
('2024-06-01', 12100000, 8000000,  33.88, 11700000, 8100000,  4100000, 'Strongest H1, finance sector wins'),
('2024-07-01', 11400000, 8100000,  28.95, 11000000, 8200000,  3300000, 'Monsoon slowdown, some delays'),
('2024-08-01', 11800000, 8000000,  32.20, 11400000, 8100000,  3800000, 'Product launch, new module sales'),
('2024-09-01', 12500000, 8300000,  33.60, 12100000, 8400000,  4200000, 'Record Q3, e-commerce vertical grew'),
('2024-10-01', 12000000, 8500000,  29.17, 11600000, 8600000,  3500000, 'Infrastructure upgrades cost increase'),
('2024-11-01', 13200000, 8700000,  34.09, 12800000, 8800000,  4500000, 'Festival season enterprise closures'),
('2024-12-01', 14100000, 9000000,  36.17, 13700000, 9100000,  5100000, 'Best month ever, year-end deals');

-- ============================================================
-- INSERT DATA — MODULE 2: REVENUE BY SERVICE TYPE
-- ============================================================

INSERT INTO revenue_by_service (month, service_type, revenue, num_deals, avg_deal_size) VALUES
-- Jan 2023
('2023-01-01','ERP License',      3800000, 4,  950000),
('2023-01-01','Implementation',   2900000, 3,  966667),
('2023-01-01','Support',          1500000, 12, 125000),
-- Feb 2023
('2023-02-01','ERP License',      4000000, 4, 1000000),
('2023-02-01','Implementation',   3100000, 3, 1033333),
('2023-02-01','Support',          1650000, 13, 126923),
-- Mar 2023
('2023-03-01','ERP License',      4400000, 5,  880000),
('2023-03-01','Implementation',   3300000, 3, 1100000),
('2023-03-01','Support',          1700000, 14, 121429),
-- Apr 2023
('2023-04-01','ERP License',      4000000, 4, 1000000),
('2023-04-01','Implementation',   3200000, 3, 1066667),
('2023-04-01','Support',          1700000, 14, 121429),
-- May 2023
('2023-05-01','ERP License',      4100000, 4, 1025000),
('2023-05-01','Implementation',   3300000, 3, 1100000),
('2023-05-01','Support',          1700000, 14, 121429),
-- Jun 2023
('2023-06-01','ERP License',      4700000, 5,  940000),
('2023-06-01','Implementation',   3800000, 4,  950000),
('2023-06-01','Support',          1700000, 14, 121429),
-- Jul 2023
('2023-07-01','ERP License',      4300000, 4, 1075000),
('2023-07-01','Implementation',   3600000, 4,  900000),
('2023-07-01','Support',          1700000, 14, 121429),
-- Aug 2023
('2023-08-01','ERP License',      4400000, 4, 1100000),
('2023-08-01','Implementation',   3600000, 3, 1200000),
('2023-08-01','Support',          1800000, 15, 120000),
-- Sep 2023
('2023-09-01','ERP License',      4800000, 5,  960000),
('2023-09-01','Implementation',   3900000, 4,  975000),
('2023-09-01','Support',          1800000, 15, 120000),
-- Oct 2023
('2023-10-01','ERP License',      4600000, 5,  920000),
('2023-10-01','Implementation',   3700000, 4,  925000),
('2023-10-01','Support',          1800000, 15, 120000),
-- Nov 2023
('2023-11-01','ERP License',      5000000, 5, 1000000),
('2023-11-01','Implementation',   4000000, 4, 1000000),
('2023-11-01','Support',          1800000, 15, 120000),
-- Dec 2023
('2023-12-01','ERP License',      5400000, 6,  900000),
('2023-12-01','Implementation',   4300000, 4, 1075000),
('2023-12-01','Support',          1800000, 15, 120000),
-- Jan 2024
('2024-01-01','ERP License',      4500000, 5,  900000),
('2024-01-01','Implementation',   3500000, 3, 1166667),
('2024-01-01','Support',          1800000, 15, 120000),
-- Feb 2024
('2024-02-01','ERP License',      4800000, 5,  960000),
('2024-02-01','Implementation',   3700000, 4,  925000),
('2024-02-01','Support',          1800000, 15, 120000),
-- Mar 2024
('2024-03-01','ERP License',      5200000, 6,  866667),
('2024-03-01','Implementation',   4100000, 4, 1025000),
('2024-03-01','Support',          1900000, 16, 118750),
-- Apr 2024
('2024-04-01','ERP License',      4900000, 5,  980000),
('2024-04-01','Implementation',   3800000, 4,  950000),
('2024-04-01','Support',          1900000, 16, 118750),
-- May 2024
('2024-05-01','ERP License',      5100000, 5, 1020000),
('2024-05-01','Implementation',   4000000, 4, 1000000),
('2024-05-01','Support',          1900000, 16, 118750),
-- Jun 2024
('2024-06-01','ERP License',      5700000, 6,  950000),
('2024-06-01','Implementation',   4500000, 5,  900000),
('2024-06-01','Support',          1900000, 16, 118750),
-- Jul 2024
('2024-07-01','ERP License',      5200000, 5, 1040000),
('2024-07-01','Implementation',   4300000, 4, 1075000),
('2024-07-01','Support',          1900000, 16, 118750),
-- Aug 2024
('2024-08-01','ERP License',      5500000, 6,  916667),
('2024-08-01','Implementation',   4400000, 4, 1100000),
('2024-08-01','Support',          1900000, 16, 118750),
-- Sep 2024
('2024-09-01','ERP License',      5900000, 6,  983333),
('2024-09-01','Implementation',   4700000, 5,  940000),
('2024-09-01','Support',          1900000, 16, 118750),
-- Oct 2024
('2024-10-01','ERP License',      5600000, 6,  933333),
('2024-10-01','Implementation',   4500000, 5,  900000),
('2024-10-01','Support',          1900000, 16, 118750),
-- Nov 2024
('2024-11-01','ERP License',      6200000, 7,  885714),
('2024-11-01','Implementation',   5000000, 5, 1000000),
('2024-11-01','Support',          2000000, 17, 117647),
-- Dec 2024
('2024-12-01','ERP License',      6700000, 7,  957143),
('2024-12-01','Implementation',   5400000, 6,  900000),
('2024-12-01','Support',          2000000, 17, 117647);



-- ============================================================
-- MODULE 3: CLIENTS — 65 Indian Companies
-- ============================================================

INSERT INTO clients (company_name, industry, city, state, onboarding_date, contract_value, contract_type, status, churn_date, account_manager, industry_segment) VALUES
-- MANUFACTURING (10)
('Tata Steel Processing Ltd',        'Manufacturing', 'Mumbai',    'Maharashtra',  '2021-03-15', 4800000, 'Multi-year', 'Active',  NULL,         'Rohan Mehta',    'Enterprise'),
('Bharat Forge Industries',          'Manufacturing', 'Pune',      'Maharashtra',  '2021-07-01', 3600000, 'Annual',     'Active',  NULL,         'Priya Sharma',   'Mid-market'),
('Supreme Industries Ltd',           'Manufacturing', 'Nagpur',    'Maharashtra',  '2022-02-10', 2800000, 'Annual',     'Active',  NULL,         'Rohan Mehta',    'Mid-market'),
('Greaves Cotton Limited',           'Manufacturing', 'Chennai',   'Tamil Nadu',   '2022-06-01', 3200000, 'Multi-year', 'Active',  NULL,         'Kavita Nair',    'Mid-market'),
('Finolex Cables Pvt Ltd',           'Manufacturing', 'Pune',      'Maharashtra',  '2023-01-20', 2600000, 'Annual',     'Active',  NULL,         'Priya Sharma',   'Mid-market'),
('Kirloskar Brothers Limited',       'Manufacturing', 'Kirloskarvadi','Maharashtra','2023-04-01', 2400000, 'Annual',    'Active',  NULL,         'Rohan Mehta',    'Mid-market'),
('Bajaj Electricals Ltd',            'Manufacturing', 'Mumbai',    'Maharashtra',  '2021-11-15', 3800000, 'Multi-year', 'Churned', '2024-02-28', 'Priya Sharma',   'Mid-market'),
('Thermax Limited',                  'Manufacturing', 'Pune',      'Maharashtra',  '2023-07-10', 1800000, 'Annual',     'Active',  NULL,         'Rohan Mehta',    'SME'),
('Godrej & Boyce Manufacturing',     'Manufacturing', 'Mumbai',    'Maharashtra',  '2022-09-01', 4200000, 'Multi-year', 'Active',  NULL,         'Kavita Nair',    'Enterprise'),
('Larsen Toubro Precision',          'Manufacturing', 'Mumbai',    'Maharashtra',  '2024-03-15', 5200000, 'Multi-year', 'New',     NULL,         'Rohan Mehta',    'Enterprise'),
-- RETAIL (9)
('Reliance Retail Ltd',              'Retail',        'Mumbai',    'Maharashtra',  '2021-05-20', 6500000, 'Multi-year', 'Active',  NULL,         'Arjun Patel',    'Enterprise'),
('D-Mart (Avenue Supermarts)',        'Retail',        'Ahmedabad', 'Gujarat',      '2021-09-01', 5800000, 'Multi-year', 'Active',  NULL,         'Arjun Patel',    'Enterprise'),
('Shoppers Stop Ltd',                'Retail',        'Mumbai',    'Maharashtra',  '2022-03-15', 3400000, 'Annual',     'Active',  NULL,         'Sneha Kapoor',   'Mid-market'),
('V-Mart Retail Ltd',                'Retail',        'Delhi',     'Delhi',        '2022-07-01', 2200000, 'Annual',     'Active',  NULL,         'Arjun Patel',    'Mid-market'),
('Lifestyle International',          'Retail',        'Bengaluru', 'Karnataka',    '2023-02-10', 2900000, 'Annual',     'Active',  NULL,         'Sneha Kapoor',   'Mid-market'),
('Fabindia Pvt Ltd',                 'Retail',        'Delhi',     'Delhi',        '2023-06-01', 1600000, 'Annual',     'Active',  NULL,         'Arjun Patel',    'SME'),
('Bata India Ltd',                   'Retail',        'Gurugram',  'Haryana',      '2021-12-01', 3000000, 'Multi-year', 'Churned', '2023-08-31', 'Sneha Kapoor',   'Mid-market'),
('Croma (Infiniti Retail)',          'Retail',        'Mumbai',    'Maharashtra',  '2024-01-15', 4100000, 'Multi-year', 'New',     NULL,         'Arjun Patel',    'Enterprise'),
('Westside (Trent Ltd)',             'Retail',        'Mumbai',    'Maharashtra',  '2023-10-01', 1900000, 'Annual',     'Active',  NULL,         'Sneha Kapoor',   'SME'),
-- FINANCE & NBFC (9)
('HDFC Securities Ltd',              'Finance',       'Mumbai',    'Maharashtra',  '2021-04-10', 7200000, 'Multi-year', 'Active',  NULL,         'Vikram Singh',   'Enterprise'),
('Bajaj Finance Ltd',                'Finance',       'Pune',      'Maharashtra',  '2021-08-15', 6800000, 'Multi-year', 'Active',  NULL,         'Vikram Singh',   'Enterprise'),
('Shriram Finance Ltd',              'Finance',       'Chennai',   'Tamil Nadu',   '2022-05-01', 3800000, 'Multi-year', 'Active',  NULL,         'Aarti Joshi',    'Mid-market'),
('Manappuram Finance Ltd',           'Finance',       'Thrissur',  'Kerala',       '2022-10-01', 2600000, 'Annual',     'Active',  NULL,         'Vikram Singh',   'Mid-market'),
('L&T Finance Holdings',             'Finance',       'Mumbai',    'Maharashtra',  '2023-03-01', 4400000, 'Multi-year', 'Active',  NULL,         'Aarti Joshi',    'Enterprise'),
('Muthoot Finance Ltd',              'Finance',       'Kochi',     'Kerala',       '2023-08-15', 3200000, 'Annual',     'Active',  NULL,         'Vikram Singh',   'Mid-market'),
('IIFL Finance Ltd',                 'Finance',       'Mumbai',    'Maharashtra',  '2022-01-10', 2900000, 'Annual',     'Churned', '2024-05-31', 'Aarti Joshi',    'Mid-market'),
('Axis Finance Ltd',                 'Finance',       'Ahmedabad', 'Gujarat',      '2024-04-01', 5100000, 'Multi-year', 'New',     NULL,         'Vikram Singh',   'Enterprise'),
('AU Small Finance Bank',            'Finance',       'Jaipur',    'Rajasthan',    '2023-11-01', 3600000, 'Annual',     'Active',  NULL,         'Aarti Joshi',    'Mid-market'),
-- HEALTHCARE (8)
('Apollo Hospitals Enterprise',      'Healthcare',    'Chennai',   'Tamil Nadu',   '2021-06-01', 5600000, 'Multi-year', 'Active',  NULL,         'Meera Pillai',   'Enterprise'),
('Fortis Healthcare Ltd',            'Healthcare',    'Gurugram',  'Haryana',      '2022-04-15', 4800000, 'Multi-year', 'Active',  NULL,         'Meera Pillai',   'Enterprise'),
('Narayana Health Pvt Ltd',          'Healthcare',    'Bengaluru', 'Karnataka',    '2022-09-01', 3600000, 'Annual',     'Active',  NULL,         'Ravi Krishnan',  'Mid-market'),
('Max Healthcare Institute',         'Healthcare',    'Delhi',     'Delhi',        '2023-05-01', 4200000, 'Multi-year', 'Active',  NULL,         'Meera Pillai',   'Enterprise'),
('Manipal Hospitals Pvt Ltd',        'Healthcare',    'Bengaluru', 'Karnataka',    '2023-09-15', 3800000, 'Multi-year', 'Active',  NULL,         'Ravi Krishnan',  'Mid-market'),
('KIMS Hospitals Ltd',               'Healthcare',    'Hyderabad', 'Telangana',    '2024-02-01', 2800000, 'Annual',     'New',     NULL,         'Meera Pillai',   'Mid-market'),
('Aster DM Healthcare',              'Healthcare',    'Kochi',     'Kerala',       '2022-11-15', 3200000, 'Annual',     'Active',  NULL,         'Ravi Krishnan',  'Mid-market'),
('Cloudnine Group of Hospitals',     'Healthcare',    'Bengaluru', 'Karnataka',    '2024-06-01', 1800000, 'Annual',     'New',     NULL,         'Meera Pillai',   'SME'),
-- E-COMMERCE (7)
('Nykaa Fashion Ltd',                'E-commerce',    'Mumbai',    'Maharashtra',  '2021-10-01', 4800000, 'Multi-year', 'Active',  NULL,         'Sanjay Verma',   'Enterprise'),
('Mamaearth (Honasa Consumer)',       'E-commerce',    'Gurugram',  'Haryana',      '2022-08-15', 3200000, 'Annual',     'Active',  NULL,         'Sanjay Verma',   'Mid-market'),
('CaratLane Trading Pvt Ltd',        'E-commerce',    'Chennai',   'Tamil Nadu',   '2023-01-10', 2400000, 'Annual',     'Active',  NULL,         'Sanjay Verma',   'Mid-market'),
('Lenskart Solutions Pvt Ltd',       'E-commerce',    'Delhi',     'Delhi',        '2022-12-01', 2800000, 'Multi-year', 'Active',  NULL,         'Sanjay Verma',   'Mid-market'),
('Boat Lifestyle (Imagine Marketing)','E-commerce',   'Delhi',     'Delhi',        '2023-06-15', 2200000, 'Annual',     'Active',  NULL,         'Pooja Desai',    'Mid-market'),
('Purplle.com',                      'E-commerce',    'Mumbai',    'Maharashtra',  '2024-03-01', 1600000, 'Annual',     'New',     NULL,         'Sanjay Verma',   'SME'),
('Meesho (Fashnear Technologies)',    'E-commerce',    'Bengaluru', 'Karnataka',    '2021-07-15', 3800000, 'Multi-year', 'Churned', '2024-01-31', 'Pooja Desai',    'Mid-market'),
-- LOGISTICS & SUPPLY CHAIN (6)
('Delhivery Ltd',                    'Logistics',     'Gurugram',  'Haryana',      '2022-02-01', 4200000, 'Multi-year', 'Active',  NULL,         'Ankit Gupta',    'Enterprise'),
('Blue Dart Express Ltd',            'Logistics',     'Mumbai',    'Maharashtra',  '2021-11-01', 3600000, 'Multi-year', 'Active',  NULL,         'Ankit Gupta',    'Mid-market'),
('Ecom Express Pvt Ltd',             'Logistics',     'Delhi',     'Delhi',        '2023-04-15', 2200000, 'Annual',     'Active',  NULL,         'Ankit Gupta',    'Mid-market'),
('Mahindra Logistics Ltd',           'Logistics',     'Mumbai',    'Maharashtra',  '2022-07-01', 3000000, 'Annual',     'Active',  NULL,         'Pooja Desai',    'Mid-market'),
('Gati Ltd',                         'Logistics',     'Hyderabad', 'Telangana',    '2023-09-01', 1800000, 'Annual',     'Active',  NULL,         'Ankit Gupta',    'SME'),
('XpressBees Logistics',             'Logistics',     'Pune',      'Maharashtra',  '2024-05-01', 2600000, 'Annual',     'New',     NULL,         'Pooja Desai',    'Mid-market'),
-- EDUCATION & EDTECH (5)
('BYJU''S (Think & Learn Pvt Ltd)',   'Education',     'Bengaluru', 'Karnataka',    '2021-09-01', 4200000, 'Multi-year', 'Churned', '2023-11-30', 'Ravi Krishnan',  'Enterprise'),
('Vedantu Innovations Pvt Ltd',      'Education',     'Bengaluru', 'Karnataka',    '2022-06-01', 2200000, 'Annual',     'Active',  NULL,         'Ravi Krishnan',  'SME'),
('upGrad Education Pvt Ltd',         'Education',     'Mumbai',    'Maharashtra',  '2023-01-15', 2800000, 'Annual',     'Active',  NULL,         'Ravi Krishnan',  'Mid-market'),
('Simplilearn Solutions Pvt Ltd',    'Education',     'Bengaluru', 'Karnataka',    '2023-07-01', 2000000, 'Annual',     'Active',  NULL,         'Meera Pillai',   'SME'),
('Great Learning Pvt Ltd',           'Education',     'Bengaluru', 'Karnataka',    '2024-04-01', 1800000, 'Annual',     'New',     NULL,         'Ravi Krishnan',  'SME'),
-- REAL ESTATE & INFRASTRUCTURE (5)
('DLF Ltd',                          'Real Estate',   'Gurugram',  'Haryana',      '2021-06-15', 5800000, 'Multi-year', 'Active',  NULL,         'Vikram Singh',   'Enterprise'),
('Godrej Properties Ltd',            'Real Estate',   'Mumbai',    'Maharashtra',  '2022-03-01', 4600000, 'Multi-year', 'Active',  NULL,         'Aarti Joshi',    'Enterprise'),
('Prestige Estates Projects',        'Real Estate',   'Bengaluru', 'Karnataka',    '2023-02-15', 3200000, 'Multi-year', 'Active',  NULL,         'Vikram Singh',   'Mid-market'),
('Sobha Ltd',                        'Real Estate',   'Bengaluru', 'Karnataka',    '2023-08-01', 2600000, 'Annual',     'Active',  NULL,         'Aarti Joshi',    'Mid-market'),
('Brigade Enterprises Ltd',          'Real Estate',   'Bengaluru', 'Karnataka',    '2024-02-15', 3000000, 'Annual',     'New',     NULL,         'Vikram Singh',   'Mid-market'),
-- FOOD & BEVERAGE (3)
('Haldirams Foods Pvt Ltd',          'Food & Bev',    'Delhi',     'Delhi',        '2022-04-01', 2800000, 'Annual',     'Active',  NULL,         'Sneha Kapoor',   'Mid-market'),
('MTR Foods Pvt Ltd',                'Food & Bev',    'Bengaluru', 'Karnataka',    '2023-03-15', 2000000, 'Annual',     'Active',  NULL,         'Sneha Kapoor',   'SME'),
('Bikaji Foods International',       'Food & Bev',    'Bikaner',   'Rajasthan',    '2024-01-10', 1600000, 'Annual',     'New',     NULL,         'Sneha Kapoor',   'SME');

-- CLIENT MONTHLY SNAPSHOTS
INSERT INTO client_monthly_snapshot (month, new_clients, churned_clients, active_clients, total_arr) VALUES
('2023-01-01', 2, 0, 32, 112000000),
('2023-02-01', 1, 0, 33, 115000000),
('2023-03-01', 3, 0, 36, 121000000),
('2023-04-01', 2, 0, 38, 127000000),
('2023-05-01', 1, 0, 39, 130000000),
('2023-06-01', 3, 1, 41, 138000000),
('2023-07-01', 1, 0, 42, 140000000),
('2023-08-01', 2, 1, 43, 145000000),
('2023-09-01', 2, 0, 45, 152000000),
('2023-10-01', 1, 0, 46, 155000000),
('2023-11-01', 2, 1, 47, 159000000),
('2023-12-01', 3, 0, 50, 168000000),
('2024-01-01', 2, 1, 51, 172000000),
('2024-02-01', 3, 0, 54, 181000000),
('2024-03-01', 4, 0, 58, 194000000),
('2024-04-01', 2, 0, 60, 200000000),
('2024-05-01', 2, 1, 61, 205000000),
('2024-06-01', 3, 0, 64, 215000000),
('2024-07-01', 1, 0, 65, 217000000),
('2024-08-01', 2, 0, 67, 224000000),
('2024-09-01', 2, 0, 69, 231000000),
('2024-10-01', 1, 0, 70, 234000000),
('2024-11-01', 3, 0, 73, 244000000),
('2024-12-01', 2, 0, 75, 251000000);



-- ============================================================
-- MODULE 4: DEPARTMENTS & EMPLOYEES
-- ============================================================

INSERT INTO departments (dept_name, dept_head, cost_center, location) VALUES
('Engineering',           'Rajesh Kumar',      'CC-001', 'Pune'),
('ERP Implementation',    'Sunita Sharma',     'CC-002', 'Mumbai'),
('Customer Support',      'Amit Pandey',       'CC-003', 'Pune'),
('Sales & Business Dev',  'Pooja Desai',       'CC-004', 'Mumbai'),
('Finance & Accounts',    'Gita Iyer',         'CC-005', 'Mumbai'),
('Human Resources',       'Neeta Joshi',       'CC-006', 'Pune'),
('Quality Assurance',     'Vinod Patil',       'CC-007', 'Pune'),
('Product Management',    'Anil Menon',        'CC-008', 'Bengaluru'),
('DevOps & Infrastructure','Raju Nair',        'CC-009', 'Pune'),
('Marketing',             'Shweta Bhatia',     'CC-010', 'Mumbai');

-- ============================================================
-- 110 EMPLOYEES
-- ============================================================

INSERT INTO employees (full_name, emp_code, department_id, designation, date_of_joining, date_of_leaving, employment_status, monthly_ctc, is_billable, city, email) VALUES
-- Engineering (dept 1) — 28 employees
('Rajesh Kumar',         'EMP001', 1, 'VP Engineering',            '2019-04-01', NULL,         'Active',    175000, false, 'Pune',      'rajesh.kumar@sigzen.in'),
('Aarav Mishra',         'EMP002', 1, 'Senior Backend Engineer',   '2020-06-15', NULL,         'Active',    115000, true,  'Pune',      'aarav.mishra@sigzen.in'),
('Priya Deshpande',      'EMP003', 1, 'Senior Backend Engineer',   '2020-08-01', NULL,         'Active',    112000, true,  'Pune',      'priya.deshpande@sigzen.in'),
('Karan Joshi',          'EMP004', 1, 'Frontend Engineer',         '2021-02-10', NULL,         'Active',    90000,  true,  'Pune',      'karan.joshi@sigzen.in'),
('Riya Malhotra',        'EMP005', 1, 'Frontend Engineer',         '2021-05-15', NULL,         'Active',    88000,  true,  'Pune',      'riya.malhotra@sigzen.in'),
('Aditya Pillai',        'EMP006', 1, 'Full Stack Engineer',       '2021-09-01', NULL,         'Active',    95000,  true,  'Pune',      'aditya.pillai@sigzen.in'),
('Sneha Gupta',          'EMP007', 1, 'Full Stack Engineer',       '2022-01-10', NULL,         'Active',    92000,  true,  'Pune',      'sneha.gupta@sigzen.in'),
('Vivek Nair',           'EMP008', 1, 'Backend Engineer',          '2022-03-15', NULL,         'Active',    82000,  true,  'Pune',      'vivek.nair@sigzen.in'),
('Pooja Rao',            'EMP009', 1, 'Backend Engineer',          '2022-07-01', NULL,         'Active',    80000,  true,  'Pune',      'pooja.rao@sigzen.in'),
('Manish Tiwari',        'EMP010', 1, 'Junior Engineer',           '2023-01-15', NULL,         'Active',    65000,  true,  'Pune',      'manish.tiwari@sigzen.in'),
('Ankita Singh',         'EMP011', 1, 'Junior Engineer',           '2023-02-01', NULL,         'Active',    63000,  true,  'Pune',      'ankita.singh@sigzen.in'),
('Devika Sharma',        'EMP012', 1, 'Junior Engineer',           '2023-06-01', NULL,         'Active',    62000,  true,  'Pune',      'devika.sharma@sigzen.in'),
('Rohan Choudhary',      'EMP013', 1, 'Senior Backend Engineer',   '2020-11-01', NULL,         'Active',    110000, true,  'Pune',      'rohan.c@sigzen.in'),
('Tanvi Patil',          'EMP014', 1, 'Frontend Engineer',         '2022-09-15', NULL,         'Active',    85000,  true,  'Pune',      'tanvi.patil@sigzen.in'),
('Siddharth Kulkarni',   'EMP015', 1, 'Software Architect',        '2019-08-01', NULL,         'Active',    150000, true,  'Pune',      'siddharth.k@sigzen.in'),
('Neha Pandey',          'EMP016', 1, 'Full Stack Engineer',       '2023-03-10', NULL,         'Active',    78000,  true,  'Pune',      'neha.pandey@sigzen.in'),
('Gaurav Mehta',         'EMP017', 1, 'Backend Engineer',          '2023-07-01', NULL,         'Active',    72000,  true,  'Pune',      'gaurav.mehta@sigzen.in'),
('Ishaan Verma',         'EMP018', 1, 'Junior Engineer',           '2024-01-15', NULL,         'Active',    60000,  true,  'Pune',      'ishaan.verma@sigzen.in'),
('Prachi Jain',          'EMP019', 1, 'Junior Engineer',           '2024-02-01', NULL,         'Active',    60000,  true,  'Pune',      'prachi.jain@sigzen.in'),
('Abhay Desai',          'EMP020', 1, 'Backend Engineer',          '2021-11-15', '2024-03-31', 'Resigned',  80000,  true,  'Pune',      'abhay.desai@sigzen.in'),
('Kavya Srinivasan',     'EMP021', 1, 'Senior Frontend Engineer',  '2020-04-01', NULL,         'Active',    105000, true,  'Bengaluru', 'kavya.s@sigzen.in'),
('Arjun Bhat',           'EMP022', 1, 'Mobile Developer',          '2022-05-01', NULL,         'Active',    88000,  true,  'Bengaluru', 'arjun.bhat@sigzen.in'),
('Divya Krishnan',       'EMP023', 1, 'Mobile Developer',          '2022-11-01', NULL,         'Active',    85000,  true,  'Bengaluru', 'divya.krishnan@sigzen.in'),
('Nikhil Aggarwal',      'EMP024', 1, 'Data Engineer',             '2021-06-15', NULL,         'Active',    98000,  true,  'Bengaluru', 'nikhil.a@sigzen.in'),
('Sonal Chopra',         'EMP025', 1, 'Data Engineer',             '2023-04-01', NULL,         'Active',    76000,  true,  'Bengaluru', 'sonal.chopra@sigzen.in'),
('Vikash Tewari',        'EMP026', 1, 'Security Engineer',         '2021-10-01', NULL,         'Active',    102000, true,  'Pune',      'vikash.t@sigzen.in'),
('Rishab Goswami',       'EMP027', 1, 'Junior Engineer',           '2024-05-01', NULL,         'Active',    58000,  true,  'Pune',      'rishab.g@sigzen.in'),
('Meghna Pillai',        'EMP028', 1, 'Junior Engineer',           '2024-06-15', NULL,         'Active',    58000,  true,  'Pune',      'meghna.p@sigzen.in'),

-- ERP Implementation (dept 2) — 22 employees
('Sunita Sharma',        'EMP029', 2, 'Head of Implementation',    '2018-06-01', NULL,         'Active',    160000, false, 'Mumbai',    'sunita.sharma@sigzen.in'),
('Amit Kale',            'EMP030', 2, 'Senior Consultant',         '2019-09-15', NULL,         'Active',    120000, true,  'Mumbai',    'amit.kale@sigzen.in'),
('Rekha Patel',          'EMP031', 2, 'Senior Consultant',         '2020-01-10', NULL,         'Active',    118000, true,  'Mumbai',    'rekha.patel@sigzen.in'),
('Suresh Iyer',          'EMP032', 2, 'ERP Consultant',            '2020-07-01', NULL,         'Active',    95000,  true,  'Mumbai',    'suresh.iyer@sigzen.in'),
('Deepa Menon',          'EMP033', 2, 'ERP Consultant',            '2021-01-15', NULL,         'Active',    92000,  true,  'Mumbai',    'deepa.menon@sigzen.in'),
('Vishal Saxena',        'EMP034', 2, 'ERP Consultant',            '2021-04-01', NULL,         'Active',    90000,  true,  'Pune',      'vishal.saxena@sigzen.in'),
('Nandini Bose',         'EMP035', 2, 'ERP Consultant',            '2021-08-15', NULL,         'Active',    88000,  true,  'Pune',      'nandini.bose@sigzen.in'),
('Rajiv Kapoor',         'EMP036', 2, 'Junior Consultant',         '2022-02-01', NULL,         'Active',    72000,  true,  'Mumbai',    'rajiv.kapoor@sigzen.in'),
('Monika Tomar',         'EMP037', 2, 'Junior Consultant',         '2022-06-15', NULL,         'Active',    70000,  true,  'Mumbai',    'monika.tomar@sigzen.in'),
('Saumya Joshi',         'EMP038', 2, 'Junior Consultant',         '2022-10-01', NULL,         'Active',    68000,  true,  'Pune',      'saumya.joshi@sigzen.in'),
('Ankur Srivastava',     'EMP039', 2, 'Senior Consultant',         '2019-11-15', NULL,         'Active',    115000, true,  'Mumbai',    'ankur.s@sigzen.in'),
('Geeta Bhatt',          'EMP040', 2, 'ERP Consultant',            '2021-12-01', NULL,         'Active',    86000,  true,  'Ahmedabad', 'geeta.bhatt@sigzen.in'),
('Pratik Pawar',         'EMP041', 2, 'Junior Consultant',         '2023-01-10', NULL,         'Active',    65000,  true,  'Pune',      'pratik.pawar@sigzen.in'),
('Shruti Agarwal',       'EMP042', 2, 'Junior Consultant',         '2023-03-01', NULL,         'Active',    63000,  true,  'Mumbai',    'shruti.a@sigzen.in'),
('Akash Dubey',          'EMP043', 2, 'ERP Consultant',            '2022-04-15', NULL,         'Active',    84000,  true,  'Pune',      'akash.dubey@sigzen.in'),
('Pallavi Rao',          'EMP044', 2, 'ERP Consultant',            '2023-06-01', NULL,         'Active',    80000,  true,  'Hyderabad', 'pallavi.rao@sigzen.in'),
('Hemant Chauhan',       'EMP045', 2, 'Senior Consultant',         '2020-09-01', '2024-01-31', 'Resigned',  110000, true,  'Mumbai',    'hemant.c@sigzen.in'),
('Lalitha Nair',         'EMP046', 2, 'ERP Consultant',            '2023-09-15', NULL,         'Active',    78000,  true,  'Kochi',     'lalitha.nair@sigzen.in'),
('Tarun Arora',          'EMP047', 2, 'Junior Consultant',         '2024-01-15', NULL,         'Active',    62000,  true,  'Mumbai',    'tarun.arora@sigzen.in'),
('Deepika Nambiar',      'EMP048', 2, 'Junior Consultant',         '2024-03-01', NULL,         'Active',    61000,  true,  'Kochi',     'deepika.n@sigzen.in'),
('Rohit Chandra',        'EMP049', 2, 'ERP Consultant',            '2024-04-15', NULL,         'Active',    76000,  true,  'Delhi',     'rohit.chandra@sigzen.in'),
('Ananya Das',           'EMP050', 2, 'Junior Consultant',         '2024-06-01', NULL,         'Active',    60000,  true,  'Kolkata',   'ananya.das@sigzen.in'),

-- Customer Support (dept 3) — 15 employees
('Amit Pandey',          'EMP051', 3, 'Head of Support',           '2018-11-01', NULL,         'Active',    145000, false, 'Pune',      'amit.pandey@sigzen.in'),
('Ritika Sharma',        'EMP052', 3, 'Senior Support Engineer',   '2020-03-15', NULL,         'Active',    85000,  true,  'Pune',      'ritika.sharma@sigzen.in'),
('Vaibhav Kulkarni',     'EMP053', 3, 'Senior Support Engineer',   '2020-08-01', NULL,         'Active',    82000,  true,  'Pune',      'vaibhav.k@sigzen.in'),
('Shilpa Rajan',         'EMP054', 3, 'Support Engineer',          '2021-05-01', NULL,         'Active',    68000,  true,  'Pune',      'shilpa.rajan@sigzen.in'),
('Naveen Kumar',         'EMP055', 3, 'Support Engineer',          '2021-10-15', NULL,         'Active',    66000,  true,  'Pune',      'naveen.kumar@sigzen.in'),
('Priyanka Vats',        'EMP056', 3, 'Support Engineer',          '2022-02-01', NULL,         'Active',    64000,  true,  'Pune',      'priyanka.vats@sigzen.in'),
('Lokesh Mishra',        'EMP057', 3, 'Support Engineer',          '2022-05-15', NULL,         'Active',    62000,  true,  'Pune',      'lokesh.m@sigzen.in'),
('Ranjana Gupta',        'EMP058', 3, 'Junior Support Analyst',    '2023-01-10', NULL,         'Active',    52000,  true,  'Pune',      'ranjana.g@sigzen.in'),
('Shankar Pillai',       'EMP059', 3, 'Junior Support Analyst',    '2023-04-01', NULL,         'Active',    50000,  true,  'Pune',      'shankar.p@sigzen.in'),
('Meenakshi Reddy',      'EMP060', 3, 'Junior Support Analyst',    '2023-08-01', NULL,         'Active',    50000,  true,  'Hyderabad', 'meenakshi.r@sigzen.in'),
('Sanjay Bhosle',        'EMP061', 3, 'Support Engineer',          '2022-09-15', NULL,         'Active',    63000,  true,  'Pune',      'sanjay.bhosle@sigzen.in'),
('Tanya Agarwal',        'EMP062', 3, 'Support Engineer',          '2023-11-01', NULL,         'Active',    60000,  true,  'Delhi',     'tanya.a@sigzen.in'),
('Harish Babu',          'EMP063', 3, 'Junior Support Analyst',    '2024-02-01', NULL,         'Active',    48000,  true,  'Chennai',   'harish.babu@sigzen.in'),
('Poornima Shetty',      'EMP064', 3, 'Junior Support Analyst',    '2024-04-15', NULL,         'Active',    48000,  true,  'Mangaluru', 'poornima.s@sigzen.in'),
('Arun Pandian',         'EMP065', 3, 'Support Engineer',          '2024-06-01', NULL,         'Active',    58000,  true,  'Chennai',   'arun.pandian@sigzen.in'),

-- Sales (dept 4) — 10 employees
('Pooja Desai',          'EMP066', 4, 'VP Sales',                  '2018-04-01', NULL,         'Active',    200000, false, 'Mumbai',    'pooja.desai@sigzen.in'),
('Rohan Mehta',          'EMP067', 4, 'Senior Account Executive',  '2020-05-01', NULL,         'Active',    110000, false, 'Mumbai',    'rohan.mehta@sigzen.in'),
('Priya Sharma',         'EMP068', 4, 'Account Executive',         '2021-02-15', NULL,         'Active',    95000,  false, 'Mumbai',    'priya.sharma@sigzen.in'),
('Kavita Nair',          'EMP069', 4, 'Account Executive',         '2021-07-01', NULL,         'Active',    92000,  false, 'Mumbai',    'kavita.nair@sigzen.in'),
('Arjun Patel',          'EMP070', 4, 'Account Executive',         '2022-01-10', NULL,         'Active',    90000,  false, 'Ahmedabad', 'arjun.patel@sigzen.in'),
('Sneha Kapoor',         'EMP071', 4, 'Account Executive',         '2022-06-01', NULL,         'Active',    88000,  false, 'Delhi',     'sneha.kapoor@sigzen.in'),
('Vikram Singh',         'EMP072', 4, 'Senior Account Executive',  '2020-10-15', NULL,         'Active',    105000, false, 'Mumbai',    'vikram.singh@sigzen.in'),
('Aarti Joshi',          'EMP073', 4, 'Account Executive',         '2021-11-01', NULL,         'Active',    90000,  false, 'Mumbai',    'aarti.joshi@sigzen.in'),
('Sanjay Verma',         'EMP074', 4, 'Account Executive',         '2022-09-01', NULL,         'Active',    87000,  false, 'Mumbai',    'sanjay.verma@sigzen.in'),
('Ankit Gupta',          'EMP075', 4, 'Account Executive',         '2023-02-01', NULL,         'Active',    82000,  false, 'Delhi',     'ankit.gupta@sigzen.in'),

-- Finance (dept 5) — 6 employees
('Gita Iyer',            'EMP076', 5, 'CFO',                       '2017-09-01', NULL,         'Active',    250000, false, 'Mumbai',    'gita.iyer@sigzen.in'),
('Prakash Malhotra',     'EMP077', 5, 'Senior Accountant',         '2019-04-15', NULL,         'Active',    95000,  false, 'Mumbai',    'prakash.m@sigzen.in'),
('Mamta Shinde',         'EMP078', 5, 'Accountant',                '2021-06-01', NULL,         'Active',    70000,  false, 'Mumbai',    'mamta.shinde@sigzen.in'),
('Harshad Shah',         'EMP079', 5, 'Finance Analyst',           '2022-08-01', NULL,         'Active',    72000,  false, 'Mumbai',    'harshad.shah@sigzen.in'),
('Vinita Rathi',         'EMP080', 5, 'Finance Analyst',           '2023-05-01', NULL,         'Active',    65000,  false, 'Mumbai',    'vinita.rathi@sigzen.in'),
('Bijoy Thomas',         'EMP081', 5, 'Accounts Executive',        '2023-10-15', NULL,         'Active',    55000,  false, 'Mumbai',    'bijoy.thomas@sigzen.in'),

-- HR (dept 6) — 5 employees
('Neeta Joshi',          'EMP082', 6, 'HR Head',                   '2018-07-01', NULL,         'Active',    130000, false, 'Pune',      'neeta.joshi@sigzen.in'),
('Sharda Kadam',         'EMP083', 6, 'HR Manager',                '2020-05-15', NULL,         'Active',    88000,  false, 'Pune',      'sharda.kadam@sigzen.in'),
('Disha Thakur',         'EMP084', 6, 'HR Business Partner',       '2022-01-10', NULL,         'Active',    72000,  false, 'Pune',      'disha.thakur@sigzen.in'),
('Chetan Pande',         'EMP085', 6, 'Talent Acquisition Lead',   '2022-07-01', NULL,         'Active',    68000,  false, 'Pune',      'chetan.pande@sigzen.in'),
('Lalita Sawant',        'EMP086', 6, 'HR Executive',              '2024-01-10', NULL,         'Active',    52000,  false, 'Pune',      'lalita.sawant@sigzen.in'),

-- Quality Assurance (dept 7) — 10 employees
('Vinod Patil',          'EMP087', 7, 'QA Lead',                   '2019-02-01', NULL,         'Active',    130000, true,  'Pune',      'vinod.patil@sigzen.in'),
('Sunanda Ghosh',        'EMP088', 7, 'Senior QA Engineer',        '2020-10-01', NULL,         'Active',    92000,  true,  'Pune',      'sunanda.ghosh@sigzen.in'),
('Kishore Raut',         'EMP089', 7, 'QA Engineer',               '2021-07-15', NULL,         'Active',    74000,  true,  'Pune',      'kishore.raut@sigzen.in'),
('Swati Bendre',         'EMP090', 7, 'QA Engineer',               '2022-03-01', NULL,         'Active',    70000,  true,  'Pune',      'swati.bendre@sigzen.in'),
('Abhijit Salve',        'EMP091', 7, 'QA Engineer',               '2022-08-15', NULL,         'Active',    68000,  true,  'Pune',      'abhijit.salve@sigzen.in'),
('Nisha Rajput',         'EMP092', 7, 'Junior QA Analyst',         '2023-01-15', NULL,         'Active',    55000,  true,  'Pune',      'nisha.rajput@sigzen.in'),
('Tejas Mane',           'EMP093', 7, 'Junior QA Analyst',         '2023-06-01', NULL,         'Active',    53000,  true,  'Pune',      'tejas.mane@sigzen.in'),
('Shraddha Katre',       'EMP094', 7, 'QA Engineer',               '2023-09-01', NULL,         'Active',    67000,  true,  'Pune',      'shraddha.k@sigzen.in'),
('Sandip Wagh',          'EMP095', 7, 'Junior QA Analyst',         '2024-02-01', NULL,         'Active',    52000,  true,  'Pune',      'sandip.wagh@sigzen.in'),
('Aditi Lonkar',         'EMP096', 7, 'Junior QA Analyst',         '2024-05-01', NULL,         'Active',    51000,  true,  'Pune',      'aditi.lonkar@sigzen.in'),

-- Product Management (dept 8) — 5 employees
('Anil Menon',           'EMP097', 8, 'VP Product',                '2018-10-01', NULL,         'Active',    195000, false, 'Bengaluru', 'anil.menon@sigzen.in'),
('Rashmi Nambiar',       'EMP098', 8, 'Senior Product Manager',    '2020-07-01', NULL,         'Active',    140000, false, 'Bengaluru', 'rashmi.n@sigzen.in'),
('Farhan Siddiqui',      'EMP099', 8, 'Product Manager',           '2022-04-01', NULL,         'Active',    115000, false, 'Bengaluru', 'farhan.s@sigzen.in'),
('Bhavana Krishnaswamy', 'EMP100', 8, 'Associate Product Manager', '2023-08-01', NULL,         'Active',    90000,  false, 'Bengaluru', 'bhavana.k@sigzen.in'),
('Samarth Gaikwad',      'EMP101', 8, 'Associate Product Manager', '2024-03-15', NULL,         'Active',    88000,  false, 'Pune',      'samarth.g@sigzen.in'),

-- DevOps (dept 9) — 6 employees
('Raju Nair',            'EMP102', 9, 'DevOps Head',               '2019-05-01', NULL,         'Active',    145000, true,  'Pune',      'raju.nair@sigzen.in'),
('Prasad Deshpande',     'EMP103', 9, 'Senior DevOps Engineer',    '2020-12-01', NULL,         'Active',    110000, true,  'Pune',      'prasad.d@sigzen.in'),
('Asha Menon',           'EMP104', 9, 'DevOps Engineer',           '2022-02-15', NULL,         'Active',    88000,  true,  'Pune',      'asha.menon@sigzen.in'),
('Kiran Bhalerao',       'EMP105', 9, 'DevOps Engineer',           '2022-09-01', NULL,         'Active',    85000,  true,  'Pune',      'kiran.bhalerao@sigzen.in'),
('Yogesh Patne',         'EMP106', 9, 'Cloud Engineer',            '2023-04-15', NULL,         'Active',    78000,  true,  'Pune',      'yogesh.patne@sigzen.in'),
('Swapnil Mhetre',       'EMP107', 9, 'Junior DevOps Analyst',     '2024-01-01', NULL,         'Active',    60000,  true,  'Pune',      'swapnil.m@sigzen.in'),

-- Marketing (dept 10) — 5 employees
('Shweta Bhatia',        'EMP108', 10, 'Marketing Head',           '2019-07-01', NULL,         'Active',    140000, false, 'Mumbai',    'shweta.bhatia@sigzen.in'),
('Ritu Agarwal',         'EMP109', 10, 'Content & SEO Manager',    '2021-03-01', NULL,         'Active',    85000,  false, 'Mumbai',    'ritu.a@sigzen.in'),
('Chirag Shah',          'EMP110', 10, 'Digital Marketing Exec',   '2022-10-01', NULL,         'Active',    68000,  false, 'Ahmedabad', 'chirag.shah@sigzen.in'),
('Poonam Shetty',        'EMP111', 10, 'Performance Marketing Mgr','2023-03-01', NULL,         'Active',    82000,  false, 'Mumbai',    'poonam.shetty@sigzen.in'),
('Ravi Krishnan',        'EMP112', 10, 'Brand & Events Manager',   '2022-06-15', NULL,         'Active',    78000,  false, 'Chennai',   'ravi.krishnan@sigzen.in'),
-- Additional: Meera Pillai (Account Manager in Sales, listed here as Sales dept)
('Meera Pillai',         'EMP113', 4, 'Account Executive',         '2022-04-01', NULL,         'Active',    89000,  false, 'Kochi',     'meera.pillai@sigzen.in');

-- ============================================================
-- EMPLOYEE MONTHLY METRICS (sample: key employees, 24 months)
-- ============================================================
-- We'll insert for 12 representative billable employees across 24 months

INSERT INTO employee_monthly_metrics (month, employee_id, billable_hours, total_hours, utilization_rate, leaves_taken, overtime_hours) VALUES
-- EMP002 Aarav Mishra — Backend Engineer
('2023-01-01', 2, 145, 176, 82.4, 1, 8),  ('2023-02-01', 2, 152, 176, 86.4, 0, 12),
('2023-03-01', 2, 148, 176, 84.1, 2, 6),  ('2023-04-01', 2, 138, 176, 78.4, 3, 4),
('2023-05-01', 2, 155, 176, 88.1, 0, 16), ('2023-06-01', 2, 162, 176, 92.0, 0, 18),
('2023-07-01', 2, 140, 176, 79.5, 2, 4),  ('2023-08-01', 2, 151, 176, 85.8, 1, 8),
('2023-09-01', 2, 158, 176, 89.8, 0, 14), ('2023-10-01', 2, 145, 176, 82.4, 2, 6),
('2023-11-01', 2, 160, 176, 90.9, 0, 20), ('2023-12-01', 2, 142, 176, 80.7, 3, 4),
('2024-01-01', 2, 148, 176, 84.1, 1, 8),  ('2024-02-01', 2, 156, 176, 88.6, 0, 12),
('2024-03-01', 2, 162, 176, 92.0, 0, 18), ('2024-04-01', 2, 144, 176, 81.8, 2, 6),
('2024-05-01', 2, 158, 176, 89.8, 1, 14), ('2024-06-01', 2, 165, 176, 93.8, 0, 20),
('2024-07-01', 2, 146, 176, 83.0, 2, 8),  ('2024-08-01', 2, 155, 176, 88.1, 1, 10),
('2024-09-01', 2, 163, 176, 92.6, 0, 16), ('2024-10-01', 2, 150, 176, 85.2, 1, 10),
('2024-11-01', 2, 166, 176, 94.3, 0, 22), ('2024-12-01', 2, 148, 176, 84.1, 2, 8),
-- EMP030 Amit Kale — Senior Implementation Consultant
('2023-01-01', 30, 158, 176, 89.8, 0, 10), ('2023-02-01', 30, 165, 176, 93.8, 0, 14),
('2023-03-01', 30, 162, 176, 92.0, 1, 12), ('2023-04-01', 30, 155, 176, 88.1, 2, 8),
('2023-05-01', 30, 168, 176, 95.5, 0, 18), ('2023-06-01', 30, 172, 176, 97.7, 0, 22),
('2023-07-01', 30, 148, 176, 84.1, 3, 4),  ('2023-08-01', 30, 162, 176, 92.0, 1, 12),
('2023-09-01', 30, 170, 176, 96.6, 0, 20), ('2023-10-01', 30, 158, 176, 89.8, 1, 10),
('2023-11-01', 30, 166, 176, 94.3, 0, 18), ('2023-12-01', 30, 152, 176, 86.4, 2, 6),
('2024-01-01', 30, 155, 176, 88.1, 1, 8),  ('2024-02-01', 30, 168, 176, 95.5, 0, 16),
('2024-03-01', 30, 172, 176, 97.7, 0, 22), ('2024-04-01', 30, 152, 176, 86.4, 3, 4),
('2024-05-01', 30, 164, 176, 93.2, 1, 12), ('2024-06-01', 30, 170, 176, 96.6, 0, 20),
('2024-07-01', 30, 150, 176, 85.2, 2, 6),  ('2024-08-01', 30, 165, 176, 93.8, 0, 14),
('2024-09-01', 30, 172, 176, 97.7, 0, 22), ('2024-10-01', 30, 160, 176, 90.9, 1, 12),
('2024-11-01', 30, 168, 176, 95.5, 0, 18), ('2024-12-01', 30, 155, 176, 88.1, 2, 8),
-- EMP052 Ritika Sharma — Senior Support Engineer
('2023-01-01', 52, 140, 176, 79.5, 1, 4),  ('2023-02-01', 52, 148, 176, 84.1, 0, 6),
('2023-03-01', 52, 145, 176, 82.4, 2, 4),  ('2023-04-01', 52, 138, 176, 78.4, 3, 2),
('2023-05-01', 52, 150, 176, 85.2, 1, 8),  ('2023-06-01', 52, 155, 176, 88.1, 0, 10),
('2023-07-01', 52, 135, 176, 76.7, 3, 0),  ('2023-08-01', 52, 142, 176, 80.7, 2, 4),
('2023-09-01', 52, 152, 176, 86.4, 0, 8),  ('2023-10-01', 52, 145, 176, 82.4, 1, 6),
('2023-11-01', 52, 155, 176, 88.1, 0, 10), ('2023-12-01', 52, 140, 176, 79.5, 3, 2),
('2024-01-01', 52, 142, 176, 80.7, 1, 4),  ('2024-02-01', 52, 150, 176, 85.2, 0, 6),
('2024-03-01', 52, 155, 176, 88.1, 1, 8),  ('2024-04-01', 52, 140, 176, 79.5, 2, 4),
('2024-05-01', 52, 152, 176, 86.4, 1, 8),  ('2024-06-01', 52, 158, 176, 89.8, 0, 12),
('2024-07-01', 52, 138, 176, 78.4, 3, 0),  ('2024-08-01', 52, 148, 176, 84.1, 1, 6),
('2024-09-01', 52, 155, 176, 88.1, 0, 10), ('2024-10-01', 52, 145, 176, 82.4, 2, 4),
('2024-11-01', 52, 160, 176, 90.9, 0, 14), ('2024-12-01', 52, 142, 176, 80.7, 2, 4);



-- ============================================================================
-- SIGZEN TECHNOLOGIES - CEO BI DASHBOARD GENERATOR SCRIPT
-- Timeframe: Jan 2023 - Dec 2024 (24 Months Time-Series)
-- Target Platform: Supabase / PostgreSQL (Native JSONB and Numeric Compatibility)
-- ============================================================================

BEGIN;

-- CLEANUP PREVIOUS STRUCTURES (IF RE-RUNNING)
DROP TABLE IF EXISTS web_ecommerce_metrics CASCADE;
DROP TABLE IF EXISTS inventory_supply_chain CASCADE;
DROP TABLE IF EXISTS quality_control_metrics CASCADE;
DROP TABLE IF EXISTS risk_alerts CASCADE;
DROP TABLE IF EXISTS customer_satisfaction CASCADE;
DROP TABLE IF EXISTS project_delivery CASCADE;
DROP TABLE IF EXISTS employee_efficiency CASCADE;
DROP TABLE IF EXISTS customer_growth CASCADE;
DROP TABLE IF EXISTS purchase_health CASCADE;
DROP TABLE IF EXISTS revenue_growth CASCADE;
DROP TABLE IF EXISTS financial_health CASCADE;

-- ==========================================
-- 1. MODULE 1: FINANCIAL HEALTH (Monthly Base)
-- ==========================================
CREATE TABLE financial_health (
    id SERIAL PRIMARY KEY,
    month_year DATE NOT NULL UNIQUE, -- First day of month
    total_revenue NUMERIC(15, 2) NOT NULL,
    total_expenses NUMERIC(15, 2) NOT NULL,
    net_profit NUMERIC(15, 2) GENERATED ALWAYS AS (total_revenue - total_expenses) STORED,
    currency VARCHAR(3) DEFAULT 'INR'
);

-- ==========================================
-- 2. MODULE 2: REVENUE GROWTH (By Service Stream)
-- ==========================================
CREATE TABLE revenue_growth (
    id SERIAL PRIMARY KEY,
    financial_month_id INT REFERENCES financial_health(id) ON DELETE CASCADE,
    license_revenue NUMERIC(15, 2) NOT NULL,
    implementation_revenue NUMERIC(15, 2) NOT NULL,
    support_revenue NUMERIC(15, 2) NOT NULL,
    CHECK (license_revenue + implementation_revenue + support_revenue > 0)
);

-- ==========================================
-- 3. MODULE 3: CUSTOMER GROWTH (Indian B2B Clients)
-- ==========================================
CREATE TABLE customer_growth (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    hq_city VARCHAR(50),
    contract_start_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Active', 'Churned', 'Onboarding')),
    churn_date DATE,
    estimated_ltv_inr NUMERIC(12, 2) NOT NULL
);

-- ==========================================
-- 4. MODULE 4: EMPLOYEE EFFICIENCY
-- ==========================================
CREATE TABLE employee_efficiency (
    id SERIAL PRIMARY KEY,
    emp_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) CHECK (department IN ('Engineering', 'Implementation', 'Sales', 'Support', 'HR', 'Admin')),
    designation VARCHAR(50),
    joining_date DATE NOT NULL,
    monthly_avg_utilization NUMERIC(5, 2) CHECK (monthly_avg_utilization BETWEEN 0 AND 100),
    evaluation_month DATE NOT NULL
);

-- ==========================================
-- 5. MODULE 5: PROJECT DELIVERY (ERP Tracking)
-- ==========================================
CREATE TABLE project_delivery (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES customer_growth(id),
    project_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    actual_end_date DATE,
    project_status VARCHAR(20) CHECK (project_status IN ('Not Started', 'In Progress', 'Delayed', 'Completed')),
    budget_allocated_inr NUMERIC(15, 2) NOT NULL
);

-- ==========================================
-- 6. MODULE 6: CUSTOMER SATISFACTION
-- ==========================================
CREATE TABLE customer_satisfaction (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES customer_growth(id),
    survey_month DATE NOT NULL,
    nps_score INT CHECK (nps_score BETWEEN -100 AND 100),
    tickets_raised INT DEFAULT 0,
    tickets_resolved INT DEFAULT 0
);

-- ==========================================
-- 7. MODULE 7: RISK ALERTS
-- ==========================================
CREATE TABLE risk_alerts (
    id SERIAL PRIMARY KEY,
    alert_date DATE DEFAULT CURRENT_DATE,
    alert_type VARCHAR(50) CHECK (alert_type IN ('Overdue Payment', 'Churn Risk', 'Project Delay Blockers', 'Low Utilization')),
    severity VARCHAR(10) CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    description TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    linked_reference_id INT -- Can map contextually depending on frontend usage
);

-- ==========================================
-- 8. MODULE 8: PURCHASE HEALTH (Procurement & Infrastructure)
-- ==========================================
CREATE TABLE purchase_health (
    id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL,
    expense_category VARCHAR(50) CHECK (expense_category IN ('Cloud Infrastructure', 'Office Assets', 'Software Licenses', 'Consultancy')),
    invoice_date DATE NOT NULL,
    amount_inr NUMERIC(15, 2) NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('Paid', 'Pending', 'Overdue'))
);

-- ==========================================
-- 9. MODULE 9: QUALITY CONTROL
-- ==========================================
CREATE TABLE quality_control_metrics (
    id SERIAL PRIMARY KEY,
    sprint_name VARCHAR(50) NOT NULL,
    sprint_start_date DATE NOT NULL,
    bugs_reported INT DEFAULT 0,
    bugs_resolved INT DEFAULT 0,
    sprint_velocity_story_points INT NOT NULL
);

-- ==========================================
-- 10. MODULE 10: INVENTORY & SUPPLY CHAIN (IT Assets)
-- ==========================================
CREATE TABLE inventory_supply_chain (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(50) CHECK (asset_type IN ('Hardware/Laptops', 'Server Rack Unit', 'Internal Tool License')),
    total_purchased INT NOT NULL,
    allocated_to_users INT NOT NULL,
    unit_cost_inr NUMERIC(12, 2) NOT NULL,
    CHECK (allocated_to_users <= total_purchased)
);

-- ==========================================
-- 11. MODULE 11: WEBSITE / ECOMMERCE
-- ==========================================
CREATE TABLE web_ecommerce_metrics (
    id SERIAL PRIMARY KEY,
    tracked_date DATE NOT NULL UNIQUE,
    traffic_sessions INT NOT NULL,
    leads_generated INT NOT NULL,
    demo_conversions INT NOT NULL,
    CHECK (leads_generated <= traffic_sessions)
);


-- ============================================================================
-- POPULATING TIME SERIES DATA (JANUARY 2023 - DECEMBER 2024)
-- ============================================================================

-- SEEDING MODULE 1 & MODULE 2 COHERENTLY (24 Rows)
-- Incorporates cyclical seasonal revenue dips in Indian FY end (March) and spikes near Diwali (Nov)
INSERT INTO financial_health (id, month_year, total_revenue, total_expenses) VALUES
(1, '2023-01-01', 4500000.00, 3200000.00),
(2, '2023-02-01', 4700000.00, 3300000.00),
(3, '2023-03-01', 3900000.00, 3500000.00), -- Q1 End dip
(4, '2023-04-01', 5100000.00, 3100000.00), -- Recovery
(5, '2023-05-01', 5250000.00, 3200000.00),
(6, '2023-06-01', 5400000.00, 3300000.00),
(7, '2023-07-01', 5600000.00, 3400000.00),
(8, '2023-08-01', 5300000.00, 3450000.00),
(9, '2023-09-01', 5800000.00, 3500000.00),
(10, '2023-10-01', 6200000.00, 3600000.00),
(11, '2023-11-01', 7100000.00, 3900000.00), -- Diwali Peak
(12, '2023-12-01', 6500000.00, 3700000.00),
(13, '2024-01-01', 6800000.00, 4100000.00),
(14, '2024-02-01', 7200000.00, 4200000.00),
(15, '2024-03-01', 5900000.00, 4500000.00), -- FY24 Close-out spending/revenue dip
(16, '2024-04-01', 7600000.00, 4000000.00),
(17, '2024-05-01', 7900000.00, 4150000.00),
(18, '2024-06-01', 8100000.00, 4200000.00),
(19, '2024-07-01', 8300000.00, 4300000.00),
(20, '2024-08-01', 8000000.00, 4400000.00),
(21, '2024-09-01', 8600000.00, 4500000.00),
(22, '2024-10-01', 9200000.00, 4700000.00),
(23, '2024-11-01', 10500000.00, 5100000.00), -- Strong Growth Peak
(24, '2024-12-01', 9800000.00, 4900000.00);

-- BREAKING REVENUE APART BY CATEGORY MATCHING FINANCIAL_HEALTH ROWS TOTALS EXACTLY
INSERT INTO revenue_growth (financial_month_id, license_revenue, implementation_revenue, support_revenue) VALUES
(1, 2000000.00, 1500000.00, 1000000.00),
(2, 2100000.00, 1600000.00, 1000000.00),
(3, 1500000.00, 1200000.00, 1200000.00),
(4, 2500000.00, 1400000.00, 1200000.00),
(5, 2450000.00, 1500000.00, 1300000.00),
(6, 2600000.00, 1500000.00, 1300000.00),
(7, 2700000.00, 1500000.00, 1400000.00),
(8, 2300000.00, 1600000.00, 1400000.00),
(9, 2800000.00, 1600000.00, 1400000.00),
(10, 3000000.00, 1700000.00, 1500000.00),
(11, 3500000.00, 2100000.00, 1500000.00),
(12, 3100000.00, 1800000.00, 1600000.00),
(13, 3200000.00, 2000000.00, 1600000.00),
(14, 3500000.00, 2000000.00, 1700000.00),
(15, 2200000.00, 1900000.00, 1800000.00),
(16, 3800000.00, 2000000.00, 1800000.00),
(17, 4000000.00, 2000000.00, 1900000.00),
(18, 4100000.00, 2100000.00, 1900000.00),
(19, 4200000.00, 2100000.00, 2000000.00),
(20, 3800000.00, 2200000.00, 2000000.00),
(21, 4300000.00, 2200000.00, 2100000.00),
(22, 4600000.00, 2400000.00, 2200000.00),
(23, 5500000.00, 2700000.00, 2300000.00),
(24, 4900000.00, 2500000.00, 2400000.00);


-- SEEDING MODULE 3: CLIENT GROWTH
INSERT INTO customer_growth (id, client_name, industry, hq_city, contract_start_date, status, churn_date, estimated_ltv_inr) VALUES
(1, 'Reliance Retail Infrastructure', 'Retail', 'Mumbai', '2023-01-15', 'Active', NULL, 4500000.00),
(2, 'Tata Motors Vendor Matrix', 'Automotive', 'Pune', '2023-02-10', 'Active', NULL, 6200000.00),
(3, 'Infosys BPO Internal Systems', 'IT Services', 'Bengaluru', '2023-03-01', 'Active', NULL, 3100000.00),
(4, 'Adani Logistics Hubs', 'Logistics', 'Ahmedabad', '2023-04-18', 'Active', NULL, 8500000.00),
(5, 'Mahindra Agro Processing', 'Agriculture', 'Nagpur', '2023-05-22', 'Churned', '2024-06-15', 1800000.00), -- Churned Risk
(6, 'Godrej Consumer Goods North', 'Manufacturing', 'Delhi', '2023-07-05', 'Active', NULL, 5000000.00),
(7, 'Wipro Consumer Venture Labs', 'Retail', 'Bengaluru', '2023-08-12', 'Active', NULL, 2900000.00),
(8, 'L&T Heavy Heavy Hydro', 'Construction', 'Surat', '2023-11-20', 'Active', NULL, 12000000.00),
(9, 'Sun Pharma Distribution East', 'Healthcare', 'Kolkata', '2024-01-10', 'Active', NULL, 7200000.00),
(10, 'HDFC Regional Loan Ops', 'Finance', 'Mumbai', '2024-02-28', 'Active', NULL, 9500000.00),
(11, 'ITC Agri-Business Division', 'FMCG', 'Guntur', '2024-04-15', 'Active', NULL, 6400000.00),
(12, 'Maruti Suzuki Supply Chain Unit', 'Automotive', 'Gurugram', '2024-06-01', 'Onboarding', NULL, 5800000.00),
(13, 'Flipkart Fulfillment Logistics', 'ECommerce', 'Bengaluru', '2024-08-19', 'Active', NULL, 11000000.00),
(14, 'Zomato Dark Kitchen Systems', 'Food Delivery', 'Gurugram', '2024-10-05', 'Onboarding', NULL, 4000000.00),
(15, 'Apollo Hospitals Enterprise', 'Healthcare', 'Chennai', '2024-11-12', 'Active', NULL, 7800000.00);


-- SEEDING MODULE 4: EMPLOYEE EFFICIENCY (Sample of core workforce representation)
INSERT INTO employee_efficiency (emp_id, full_name, department, designation, joining_date, monthly_avg_utilization, evaluation_month) VALUES
('SIG-001', 'Arjun Sharma', 'Engineering', 'Principal Architect', '2023-01-01', 88.50, '2024-12-01'),
('SIG-002', 'Priya Patel', 'Implementation', 'Senior ERP Consultant', '2023-02-15', 92.00, '2024-12-01'),
('SIG-003', 'Rohan Das', 'Engineering', 'Backend Engineer', '2023-05-10', 74.00, '2024-12-01'),
('SIG-004', 'Ananya Reddy', 'Support', 'L2 Support Lead', '2023-06-01', 82.50, '2024-12-01'),
('SIG-005', 'Amit Joshi', 'Implementation', 'Junior Consultant', '2023-08-20', 45.00, '2024-12-01'), -- Low Bench Utilization Alert
('SIG-006', 'Sneha Nair', 'Sales', 'Account Director', '2023-11-01', 85.00, '2024-12-01');


-- SEEDING MODULE 5: PROJECT DELIVERY
INSERT INTO project_delivery (client_id, project_name, start_date, planned_end_date, actual_end_date, project_status, budget_allocated_inr) VALUES
(1, 'Reliance Core ERP Implementation', '2023-02-01', '2023-09-30', '2023-10-15', 'Completed', 2500000.00),
(2, 'Tata Fleet Module Deployment', '2023-03-15', '2023-12-15', '2023-12-12', 'Completed', 3500000.00),
(4, 'Adani Multi-Port ERP Integration', '2023-05-01', '2024-04-30', NULL, 'Delayed', 5000000.00), -- Overdue/Risk
(8, 'L&T Material Management Engine', '2023-12-01', '2024-08-31', '2024-09-10', 'Completed', 6000000.00),
(10, 'HDFC Loan Underwriting Pipeline', '2024-03-15', '2024-11-30', NULL, 'In Progress', 4500000.00),
(12, 'Maruti Assembly Line Mapping', '2024-07-01', '2025-02-28', NULL, 'In Progress', 3000000.00);


-- SEEDING MODULE 6: CUSTOMER SATISFACTION (NPS & Support Tickets)
INSERT INTO customer_satisfaction (client_id, survey_month, nps_score, tickets_raised, tickets_resolved) VALUES
(1, '2024-11-01', 65, 12, 12),
(2, '2024-11-01', 70, 8, 7),
(4, '2024-11-01', 15, 45, 28), -- Bad Health Sign / Low NPS / Project Delayed
(5, '2024-05-01', -10, 22, 14), -- Prior to Churn month
(8, '2024-11-01', 58, 19, 18),
(10, '2024-11-01', 45, 6, 6);


-- SEEDING MODULE 7: RISK ALERTS
INSERT INTO risk_alerts (alert_date, alert_type, severity, description, is_resolved) VALUES
('2024-04-15', 'Project Delay Blockers', 'High', 'Adani Multi-Port ERP Integration misses data center validation signoff.', FALSE),
('2024-05-10', 'Churn Risk', 'Critical', 'Mahindra Agro Processing expresses dissatisfaction with L3 support turnaround timelines.', TRUE),
('2024-11-05', 'Overdue Payment', 'Medium', 'Sun Pharma Distribution East milestone 2 billing payment overdue by 45 days.', FALSE),
('2024-12-01', 'Low Utilization', 'Low', 'Implementation Team bench utilization dipped below target SLA benchmarks.', FALSE);


-- SEEDING MODULE 8: PURCHASE HEALTH
INSERT INTO purchase_health (vendor_name, expense_category, invoice_date, amount_inr, payment_status) VALUES
('AWS India Cloud Services', 'Cloud Infrastructure', '2024-11-10', 450000.00, 'Paid'),
('CtrlS Datacenters Hyderabad', 'Cloud Infrastructure', '2024-11-15', 320000.00, 'Paid'),
('Dell Enterprise India', 'Office Assets', '2024-11-20', 1200000.00, 'Pending'),
('JetBrains Corporate Sales', 'Software Licenses', '2024-12-01', 180000.00, 'Paid');


-- SEEDING MODULE 9: QUALITY CONTROL
INSERT INTO quality_control_metrics (sprint_name, sprint_start_date, bugs_reported, bugs_resolved, sprint_velocity_story_points) VALUES
('Sprint 24-A1', '2024-10-01', 24, 20, 145),
('Sprint 24-A2', '2024-10-15', 31, 28, 138),
('Sprint 24-B1', '2024-11-01', 18, 18, 152),
('Sprint 24-B2', '2024-11-15', 42, 22, 110), -- Regression Bug Spike / Velocity drop
('Sprint 24-C1', '2024-12-01', 15, 25, 160);


-- SEEDING MODULE 10: INVENTORY & SUPPLY CHAIN
INSERT INTO inventory_supply_chain (asset_name, asset_type, total_purchased, allocated_to_users, unit_cost_inr) VALUES
('Dell Latitude 5440 Laptops', 'Hardware/Laptops', 150, 132, 75000.00),
('Apple MacBook Pro M3 16"', 'Hardware/Laptops', 25, 22, 210000.00),
('Atlassian Jira Enterprise Suite', 'Internal Tool License', 150, 145, 1200.00),
('GitHub Enterprise Seats', 'Internal Tool License', 120, 112, 1800.00);


-- SEEDING MODULE 11: WEBSITE / ECOMMERCE (Sample time-series capture showing inbound interest conversion)
INSERT INTO web_ecommerce_metrics (tracked_date, traffic_sessions, leads_generated, demo_conversions) VALUES
('2024-11-01', 2500, 120, 12),
('2024-11-15', 2800, 145, 18),
('2024-12-01', 3100, 190, 25), -- Post-Diwali B2B marketing campaign peak
('2024-12-15', 2400, 95, 8);

COMMIT;



