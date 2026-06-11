import os
from dotenv import load_dotenv

os.environ['ANONYMIZED_TELEMETRY'] = 'False'
os.environ['CHROMA_TELEMETRY_ON'] = 'False'

import logging
logging.getLogger('chromadb').setLevel(logging.ERROR)

from vanna.ollama import Ollama
from vanna.chromadb import ChromaDB_VectorStore

load_dotenv()

class SigzenVanna(ChromaDB_VectorStore, Ollama):
    def __init__(self, config=None):
        ChromaDB_VectorStore.__init__(
            self,
            config={
                'collection_name': 'sigzen_bi',
                'path': './chroma_db'
            }
        )
        Ollama.__init__(
            self,
            config={
                'model': os.getenv(
                    'OLLAMA_MODEL',
                    'deepseek-coder:6.7b-instruct-q4_K_M'
                ),
                'ollama_host': os.getenv(
                    'OLLAMA_HOST',
                    'http://localhost:11434'
                )
            }
        )

    def run_sql(self, sql: str):
        """Override to prevent direct DB connection"""
        return None

def get_vanna_instance():
    vn = SigzenVanna()
    return vn

def train_vanna(vn: SigzenVanna):
    print("Training Vanna on schema DDL...")

    vn.train(ddl="""
        CREATE TABLE financial_monthly (
            id SERIAL PRIMARY KEY,
            month DATE NOT NULL,
            revenue NUMERIC(15,2),
            expenses NUMERIC(15,2),
            gross_profit NUMERIC(15,2),
            profit_margin_pct NUMERIC(5,2),
            cash_inflow NUMERIC(15,2),
            cash_outflow NUMERIC(15,2),
            net_cash_flow NUMERIC(15,2),
            ebitda NUMERIC(15,2),
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE revenue_by_service (
            id SERIAL PRIMARY KEY,
            month DATE NOT NULL,
            service_type VARCHAR(100),
            revenue NUMERIC(15,2),
            num_deals INTEGER,
            avg_deal_size NUMERIC(15,2),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE client_monthly_snapshot (
            id SERIAL PRIMARY KEY,
            month DATE NOT NULL,
            new_clients INTEGER,
            churned_clients INTEGER,
            active_clients INTEGER,
            total_arr NUMERIC(15,2),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE clients (
            id SERIAL PRIMARY KEY,
            company_name VARCHAR(150),
            industry VARCHAR(100),
            city VARCHAR(50),
            state VARCHAR(50),
            onboarding_date DATE,
            contract_value NUMERIC(12,2),
            contract_type VARCHAR(50),
            status VARCHAR(20),
            churn_date DATE,
            account_manager VARCHAR(100),
            industry_segment VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE employees (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(100),
            emp_code VARCHAR(20),
            department_id INTEGER,
            designation VARCHAR(50),
            date_of_joining DATE,
            date_of_leaving DATE,
            employment_status VARCHAR(20),
            monthly_ctc NUMERIC(12,2),
            is_billable BOOLEAN,
            city VARCHAR(50),
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE departments (
            id SERIAL PRIMARY KEY,
            dept_name VARCHAR(100),
            dept_head VARCHAR(100),
            cost_center VARCHAR(50),
            location VARCHAR(50),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE employee_monthly_metrics (
            id SERIAL PRIMARY KEY,
            month DATE NOT NULL,
            employee_id INTEGER REFERENCES employees(id),
            billable_hours NUMERIC(6,2),
            total_hours NUMERIC(6,2),
            utilization_rate NUMERIC(5,2),
            leaves_taken INTEGER,
            overtime_hours NUMERIC(6,2),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE projects (
            id SERIAL PRIMARY KEY,
            client_id INTEGER REFERENCES clients(id),
            project_name VARCHAR(150),
            project_type VARCHAR(100),
            start_date DATE,
            planned_end_date DATE,
            actual_end_date DATE,
            status VARCHAR(20),
            budget_inr NUMERIC(15,2),
            project_manager_id INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE nps_scores (
            id SERIAL PRIMARY KEY,
            client_id INTEGER REFERENCES clients(id),
            survey_date DATE,
            nps_score INTEGER,
            feedback_text TEXT,
            responded_by VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE support_tickets (
            id SERIAL PRIMARY KEY,
            client_id INTEGER REFERENCES clients(id),
            subject VARCHAR(200),
            priority VARCHAR(20),
            status VARCHAR(20),
            created_date DATE,
            resolved_date DATE,
            resolution_time_hours NUMERIC(8,2),
            satisfaction_rating INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE risk_alerts (
            id SERIAL PRIMARY KEY,
            alert_date DATE,
            alert_type VARCHAR(100),
            severity VARCHAR(20),
            description TEXT,
            linked_client_id INTEGER,
            linked_project_id INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE purchase_orders (
            id SERIAL PRIMARY KEY,
            vendor_id INTEGER REFERENCES vendors(id),
            order_date DATE,
            description TEXT,
            amount_inr NUMERIC(15,2),
            status VARCHAR(20),
            invoice_date DATE,
            paid_date DATE,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE vendors (
            id SERIAL PRIMARY KEY,
            vendor_name VARCHAR(100),
            category VARCHAR(50),
            contact_email VARCHAR(100),
            payment_terms_days INTEGER,
            is_active BOOLEAN,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE sprints (
            id SERIAL PRIMARY KEY,
            sprint_name VARCHAR(50),
            start_date DATE,
            end_date DATE,
            team VARCHAR(50),
            status VARCHAR(20),
            planned_points INTEGER,
            completed_points INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE bug_reports (
            id SERIAL PRIMARY KEY,
            sprint_id INTEGER REFERENCES sprints(id),
            title VARCHAR(200),
            severity VARCHAR(20),
            status VARCHAR(20),
            reported_by INTEGER,
            assigned_to INTEGER,
            created_at TIMESTAMP,
            resolved_at TIMESTAMP
        );
    """)

    vn.train(ddl="""
        CREATE TABLE hardware_assets (
            id SERIAL PRIMARY KEY,
            asset_name VARCHAR(100),
            asset_type VARCHAR(50),
            purchase_date DATE,
            purchase_cost_inr NUMERIC(12,2),
            assigned_to_employee_id INTEGER,
            condition VARCHAR(20),
            is_active BOOLEAN,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE software_licenses (
            id SERIAL PRIMARY KEY,
            software_name VARCHAR(100),
            vendor_id INTEGER REFERENCES vendors(id),
            license_type VARCHAR(50),
            total_seats INTEGER,
            used_seats INTEGER,
            cost_per_seat_inr NUMERIC(10,2),
            renewal_date DATE,
            status VARCHAR(20),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    vn.train(ddl="""
        CREATE TABLE website_monthly_metrics (
            id SERIAL PRIMARY KEY,
            month DATE NOT NULL,
            total_sessions INTEGER,
            unique_visitors INTEGER,
            leads_generated INTEGER,
            demo_requests INTEGER,
            conversions INTEGER,
            bounce_rate_pct NUMERIC(5,2),
            avg_session_duration_sec INTEGER,
            top_traffic_source VARCHAR(50),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    print("Training Vanna on business context...")

    vn.train(documentation="""
        Sigzen Technologies is an Indian ERP software company.
        Revenue is measured in INR (Indian Rupees).
        The company has 3 service types:
        ERP License, Implementation, Support.
        Financial year runs April to March (Indian FY).
        Peak revenue months are November (Diwali)
        and January (new FY budgets).
        Slow months are March (FY closing)
        and August (monsoon season).
        active_clients means currently paying customers.
        churned_clients means customers who left.
        NPS score above 50 means Promoter zone (good).
        NPS score 0-49 means Passive zone (neutral).
        NPS score below 0 means Detractor zone (bad).
        Project status: Completed, In Progress, Delayed, On Hold.
        Employee utilization above 80% is good.
        Employee utilization below 60% means bench.
        Risk alert severity: Critical, High, Medium, Low.
        All monetary values are in INR.
        1 Crore = 10,000,000 INR.
        1 Lakh = 100,000 INR.
    """)

    print("Training Vanna on example questions...")

    vn.train(
        question="What was the total revenue in 2024?",
        sql="""
            SELECT
                EXTRACT(YEAR FROM month) as year,
                SUM(revenue) as total_revenue,
                SUM(gross_profit) as total_profit,
                ROUND(AVG(profit_margin_pct), 2) as avg_margin
            FROM financial_monthly
            WHERE EXTRACT(YEAR FROM month) = 2024
            GROUP BY year;
        """
    )

    vn.train(
        question="Compare revenue across all years",
        sql="""
            SELECT
                EXTRACT(YEAR FROM month) as year,
                SUM(revenue) as total_revenue,
                SUM(expenses) as total_expenses,
                SUM(gross_profit) as total_profit,
                ROUND(AVG(profit_margin_pct), 2) as avg_margin_pct
            FROM financial_monthly
            GROUP BY year
            ORDER BY year;
        """
    )

    vn.train(
        question="How many active clients do we have?",
        sql="""
            SELECT
                active_clients,
                new_clients,
                churned_clients,
                TO_CHAR(month, 'Mon YYYY') as month
            FROM client_monthly_snapshot
            ORDER BY month DESC
            LIMIT 1;
        """
    )

    vn.train(
        question="Which clients have the highest contract value?",
        sql="""
            SELECT
                company_name,
                industry,
                city,
                contract_value,
                status
            FROM clients
            WHERE status = 'Active'
            ORDER BY contract_value DESC
            LIMIT 10;
        """
    )

    vn.train(
        question="What is the average NPS score?",
        sql="""
            SELECT
                ROUND(AVG(nps_score), 1) as avg_nps,
                COUNT(CASE WHEN nps_score >= 50
                    THEN 1 END) as promoters,
                COUNT(CASE WHEN nps_score BETWEEN 0 AND 49
                    THEN 1 END) as passives,
                COUNT(CASE WHEN nps_score < 0
                    THEN 1 END) as detractors,
                COUNT(*) as total_responses
            FROM nps_scores;
        """
    )

    vn.train(
        question="How many projects are delayed?",
        sql="""
            SELECT
                status,
                COUNT(*) as count,
                ROUND(
                    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(),
                    1
                ) as percentage
            FROM projects
            GROUP BY status
            ORDER BY count DESC;
        """
    )

    vn.train(
        question="What is employee utilization by department?",
        sql="""
            SELECT
                d.dept_name,
                COUNT(DISTINCT e.id) as headcount,
                ROUND(AVG(em.utilization_rate), 1)
                    as avg_utilization
            FROM employee_monthly_metrics em
            JOIN employees e ON em.employee_id = e.id
            JOIN departments d ON e.department_id = d.id
            WHERE em.month = (
                SELECT MAX(month)
                FROM employee_monthly_metrics
            )
            GROUP BY d.dept_name
            ORDER BY avg_utilization DESC;
        """
    )

    vn.train(
        question="What are the critical risk alerts?",
        sql="""
            SELECT
                alert_type,
                severity,
                description,
                alert_date
            FROM risk_alerts
            WHERE severity IN ('Critical', 'High')
            ORDER BY
                CASE severity
                    WHEN 'Critical' THEN 1
                    WHEN 'High' THEN 2
                END,
                alert_date DESC;
        """
    )

    vn.train(
        question="What is website traffic trend?",
        sql="""
            SELECT
                TO_CHAR(month, 'Mon YYYY') as month,
                total_sessions,
                unique_visitors,
                leads_generated,
                conversions
            FROM website_monthly_metrics
            ORDER BY month DESC
            LIMIT 12;
        """
    )

    vn.train(
        question="Which clients churned?",
        sql="""
            SELECT
                company_name,
                industry,
                city,
                contract_value,
                churn_date
            FROM clients
            WHERE status = 'Churned'
            ORDER BY churn_date DESC;
        """
    )

    print("Vanna training complete!")
    return vn


if __name__ == "__main__":
    print("Initializing Vanna AI for Sigzen BI...")
    vn = get_vanna_instance()
    train_vanna(vn)
    print("Setup complete! Vanna is ready.")