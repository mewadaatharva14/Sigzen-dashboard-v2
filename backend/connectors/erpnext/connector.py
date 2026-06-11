# backend/connectors/erpnext/connector.py
"""
ERPNext / Frappe driver.

Owns everything ERPNext-specific: auth, DocType fetching, and shaping raw
DocTypes into the dashboard's {data, summary} report shape. The rest of the
app touches none of this directly — it goes through BaseConnector.get_report.
"""

import os
import json
import requests
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv

from ..base import BaseConnector

load_dotenv()


class ERPNextConnector(BaseConnector):
    erp_type = "erpnext"

    # (module, resource) -> handler method name
    CAPABILITIES = {
        # Accounting
        ("accounting", "sales-invoices"): "report_sales_invoices",
        ("accounting", "purchase-invoices"): "report_purchase_invoices",
        ("accounting", "payments"): "report_payments",
        ("accounting", "journal-entries"): "report_journal_entries",
        # Sales & CRM
        ("sales", "orders"): "report_sales_orders",
        ("sales", "quotations"): "report_quotations",
        ("sales", "leads"): "report_leads",
        ("sales", "opportunities"): "report_opportunities",
        # Procurement
        ("purchase", "orders"): "report_purchase_orders",
        ("procurement", "suppliers"): "report_suppliers",
        # Inventory & Stock
        ("inventory", "stock"): "report_stock",
        ("inventory", "items"): "report_items",
        ("inventory", "delivery-notes"): "report_delivery_notes",
        ("inventory", "purchase-receipts"): "report_purchase_receipts",
        # Projects
        ("projects", "list"): "report_projects",
        ("projects", "tasks"): "report_tasks",
        # Support
        ("support", "issues"): "report_issues",
        # HR
        ("hr", "employees"): "report_employees",
        ("hr", "salary"): "report_salary",
    }

    def __init__(self, credentials: Optional[dict] = None):
        super().__init__(credentials)
        if credentials:
            self.base_url = credentials.get("url", "").rstrip("/")
            self.api_key = credentials.get("api_key", "")
            self.api_secret = credentials.get("api_secret", "")
        else:
            # fallback to .env (keeps backward compatibility)
            self.base_url = os.getenv("ERPNEXT_URL", "").rstrip("/")
            self.api_key = os.getenv("ERPNEXT_API_KEY", "")
            self.api_secret = os.getenv("ERPNEXT_API_SECRET", "")

        self.headers = {
            "Authorization": f"token {self.api_key}:{self.api_secret}",
            "Content-Type": "application/json",
        }

    # ── CONNECTION ───────────────────────────────────────
    def _is_configured(self) -> bool:
        """True only when URL, key and secret are all present."""
        return bool(self.base_url and self.api_key and self.api_secret)

    def _get(self, doctype: str, fields: list, filters: list = [], limit: int = 500) -> list:
        """Generic GET for any ERPNext DocType"""
        if not self._is_configured():
            return []

        url = f"{self.base_url}/api/resource/{doctype}"
        params = {
            "fields": json.dumps(fields),
            "filters": json.dumps(filters) if filters else None,
            "limit_page_length": limit,
        }
        params = {k: v for k, v in params.items() if v is not None}

        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            if response.status_code == 200:
                return response.json().get("data", [])
            else:
                print(f"ERPNext API Error {response.status_code}: {response.text}")
                return []
        except Exception as e:
            print(f"ERPNext request failed: {e}")
            return []

    def test_connection(self) -> dict:
        """Call frappe.auth.get_logged_user and return status."""
        if not self._is_configured():
            return {"status": "offline", "error": "ERPNext not configured"}

        url = f"{self.base_url}/api/method/frappe.auth.get_logged_user"
        try:
            response = requests.get(url, headers=self.headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                return {"status": "online", "user": data.get("message", "Unknown")}
            else:
                return {"status": "offline", "error": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"status": "offline", "error": str(e)}

    # ── RAW DOCTYPE FETCHERS ─────────────────────────────
    def get_sales_invoices(self, year: Optional[int] = None) -> list:
        filters = self._year_filter("posting_date", year)
        return self._get("Sales Invoice", ["name", "customer", "grand_total", "outstanding_amount", "status", "posting_date", "due_date", "currency"], filters)

    def get_purchase_invoices(self, year: Optional[int] = None) -> list:
        filters = self._year_filter("posting_date", year)
        return self._get("Purchase Invoice", ["name", "supplier", "grand_total", "outstanding_amount", "status", "posting_date", "due_date"], filters)

    def get_payment_entries(self, year: Optional[int] = None) -> list:
        filters = self._year_filter("posting_date", year)
        return self._get("Payment Entry", ["name", "payment_type", "party", "paid_amount", "posting_date", "mode_of_payment", "reference_no"], filters)

    def get_journal_entries(self, year: Optional[int] = None) -> list:
        filters = self._year_filter("posting_date", year)
        return self._get("Journal Entry", ["name", "posting_date", "total_debit", "total_credit", "voucher_type", "remark"], filters)

    def get_stock_summary(self) -> list:
        return self._get("Bin", ["item_code", "warehouse", "actual_qty", "reserved_qty", "valuation_rate", "stock_value"])

    def get_items(self) -> list:
        return self._get("Item", ["name", "item_name", "item_group", "stock_uom", "is_stock_item", "standard_rate"])

    def get_sales_orders(self, year: Optional[int] = None) -> list:
        filters = self._year_filter("transaction_date", year)
        return self._get("Sales Order", ["name", "customer", "grand_total", "status", "transaction_date", "delivery_date", "per_delivered"], filters)

    def get_quotations(self, year: Optional[int] = None) -> list:
        filters = self._year_filter("transaction_date", year)
        return self._get("Quotation", ["name", "party_name", "grand_total", "status", "transaction_date"], filters)

    def get_purchase_orders(self, year: Optional[int] = None) -> list:
        filters = self._year_filter("transaction_date", year)
        return self._get("Purchase Order", ["name", "supplier", "grand_total", "status", "transaction_date", "schedule_date", "per_received"], filters)

    def get_employees(self) -> list:
        return self._get("Employee", ["name", "employee_name", "department", "designation", "date_of_joining", "status", "company"])

    def get_salary_slips(self, year: Optional[int] = None) -> list:
        filters = self._year_filter("posting_date", year)
        return self._get("Salary Slip", ["name", "employee", "employee_name", "gross_pay", "net_pay", "posting_date", "month", "department"], filters)

    # New DocTypes (operational / current-state — not year-filtered)
    def get_leads(self) -> list:
        # 'source' is a restricted field on Lead in this Frappe version — use territory.
        return self._get("Lead", ["name", "lead_name", "company_name", "status", "territory", "creation"])

    def get_opportunities(self) -> list:
        return self._get("Opportunity", ["name", "party_name", "status", "opportunity_amount", "sales_stage", "opportunity_from", "transaction_date"])

    def get_suppliers(self) -> list:
        return self._get("Supplier", ["name", "supplier_name", "supplier_group", "supplier_type", "country", "disabled"])

    def get_delivery_notes(self) -> list:
        return self._get("Delivery Note", ["name", "customer", "status", "grand_total", "posting_date", "per_billed"])

    def get_purchase_receipts(self) -> list:
        return self._get("Purchase Receipt", ["name", "supplier", "status", "grand_total", "posting_date", "per_billed"])

    def get_projects(self) -> list:
        return self._get("Project", ["name", "project_name", "status", "percent_complete", "priority", "expected_start_date", "expected_end_date"])

    def get_tasks(self) -> list:
        return self._get("Task", ["name", "subject", "status", "priority", "exp_start_date", "exp_end_date", "progress", "project"])

    def get_issues(self) -> list:
        # `resolution_date` is permission-restricted on Frappe Cloud (HTTP 417
        # "Field not permitted in query"), so we don't request it.
        return self._get("Issue", ["name", "subject", "status", "priority", "issue_type", "opening_date"])

    @staticmethod
    def _year_filter(date_field: str, year: Optional[int]) -> list:
        if not year:
            return []
        return [
            [date_field, ">=", f"{year}-01-01"],
            [date_field, "<=", f"{year}-12-31"],
        ]

    # ── REPORTS (data + summary) ─────────────────────────
    def report_sales_invoices(self, params: dict):
        year = params.get("year")
        invoices = self.get_sales_invoices(year)
        paid_count = sum(1 for inv in invoices if inv.get("status") == "Paid")
        now_str = datetime.today().strftime("%Y-%m-%d")
        overdue_count = sum(
            1 for inv in invoices
            if inv.get("status") != "Paid" and inv.get("due_date")
            and inv.get("due_date") < now_str
        )
        total_value = sum(self._f(inv.get("grand_total")) for inv in invoices)
        outstanding_value = sum(self._f(inv.get("outstanding_amount")) for inv in invoices)
        summary = {
            "total_count": len(invoices),
            "paid_count": paid_count,
            "overdue_count": overdue_count,
            "total_value": round(total_value, 2),
            "collected_value": round(total_value - outstanding_value, 2),
            "outstanding_value": round(outstanding_value, 2),
        }
        return invoices, summary

    def report_purchase_invoices(self, params: dict):
        year = params.get("year")
        invoices = self.get_purchase_invoices(year)
        paid_count = sum(1 for inv in invoices if inv.get("status") == "Paid")
        total_value = sum(self._f(inv.get("grand_total")) for inv in invoices)
        outstanding_value = sum(self._f(inv.get("outstanding_amount")) for inv in invoices)
        summary = {
            "total_count": len(invoices),
            "paid_count": paid_count,
            "pending_count": len(invoices) - paid_count,
            "total_value": round(total_value, 2),
            "paid_value": round(total_value - outstanding_value, 2),
            "outstanding_value": round(outstanding_value, 2),
        }
        return invoices, summary

    def report_payments(self, params: dict):
        year = params.get("year")
        payments = self.get_payment_entries(year)
        monthly = {}
        total_received = total_paid = 0.0
        for p in payments:
            amt = self._f(p.get("paid_amount"))
            date_str = p.get("posting_date")
            if not date_str:
                continue
            month = date_str[:7]
            monthly.setdefault(month, {"month": month, "received": 0.0, "paid": 0.0})
            if p.get("payment_type") == "Receive":
                monthly[month]["received"] += amt
                total_received += amt
            elif p.get("payment_type") == "Pay":
                monthly[month]["paid"] += amt
                total_paid += amt
        data = [monthly[m] for m in sorted(monthly)]
        summary = {"total_received": round(total_received, 2), "total_paid": round(total_paid, 2)}
        return data, summary

    def report_journal_entries(self, params: dict):
        entries = self.get_journal_entries(params.get("year"))
        summary = {
            "total_count": len(entries),
            "total_debit": round(sum(self._f(e.get("total_debit")) for e in entries), 2),
            "total_credit": round(sum(self._f(e.get("total_credit")) for e in entries), 2),
        }
        return entries, summary

    def report_stock(self, params: dict):
        stock = self.get_stock_summary()
        low_stock_count = 0
        total_qty = total_value = 0.0
        for item in stock:
            qty = self._f(item.get("actual_qty"))
            item["low_stock"] = qty < 10
            if qty < 10:
                low_stock_count += 1
            total_qty += qty
            total_value += self._f(item.get("stock_value"))
        summary = {
            "total_items": len(stock),
            "low_stock_count": low_stock_count,
            "total_qty": total_qty,
            "total_value": round(total_value, 2),
        }
        return stock, summary

    def report_items(self, params: dict):
        items = self.get_items()
        summary = {
            "total_count": len(items),
            "stock_items_count": sum(1 for i in items if i.get("is_stock_item")),
        }
        return items, summary

    def report_sales_orders(self, params: dict):
        orders = self.get_sales_orders(params.get("year"))
        draft = sum(1 for o in orders if o.get("status") == "Draft")
        submitted = sum(1 for o in orders if o.get("status") in ["To Deliver and Bill", "Submitted"])
        delivered = sum(1 for o in orders if o.get("status") == "Completed" or self._f(o.get("per_delivered")) >= 100)
        cancelled = sum(1 for o in orders if o.get("status") == "Cancelled")
        summary = {
            "total_count": len(orders),
            "draft_count": draft,
            "submitted_count": submitted,
            "delivered_count": delivered,
            "cancelled_count": cancelled,
            "total_value": round(sum(self._f(o.get("grand_total")) for o in orders), 2),
        }
        return orders, summary

    def report_quotations(self, params: dict):
        quotes = self.get_quotations(params.get("year"))
        total_count = len(quotes)
        ordered_count = sum(1 for q in quotes if q.get("status") == "Ordered")
        lost_count = sum(1 for q in quotes if q.get("status") == "Lost")
        conversion = (ordered_count / total_count * 100.0) if total_count else 0.0
        summary = {
            "total_count": total_count,
            "ordered_count": ordered_count,
            "lost_count": lost_count,
            "conversion_rate_pct": round(conversion, 2),
            "total_value": round(sum(self._f(q.get("grand_total")) for q in quotes), 2),
        }
        return quotes, summary

    def report_purchase_orders(self, params: dict):
        orders = self.get_purchase_orders(params.get("year"))
        received = sum(1 for o in orders if self._f(o.get("per_received")) >= 100)
        summary = {
            "total_count": len(orders),
            "received_count": received,
            "pending_count": len(orders) - received,
            "total_value": round(sum(self._f(o.get("grand_total")) for o in orders), 2),
        }
        return orders, summary

    def report_employees(self, params: dict):
        employees = self.get_employees()
        dept_counts = {}
        active_count = 0
        for emp in employees:
            dept = emp.get("department") or "Unassigned"
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
            if emp.get("status") == "Active":
                active_count += 1
        summary = {
            "total_count": len(employees),
            "active_count": active_count,
            "department_breakdown": dept_counts,
        }
        return employees, summary

    def report_salary(self, params: dict):
        slips = self.get_salary_slips(params.get("year"))
        monthly = {}
        total_gross = total_net = 0.0
        for s in slips:
            gross = self._f(s.get("gross_pay"))
            net = self._f(s.get("net_pay"))
            date_str = s.get("posting_date")
            if not date_str:
                continue
            month = date_str[:7]
            monthly.setdefault(month, {"month": month, "gross_pay": 0.0, "net_pay": 0.0, "slip_count": 0})
            monthly[month]["gross_pay"] += gross
            monthly[month]["net_pay"] += net
            monthly[month]["slip_count"] += 1
            total_gross += gross
            total_net += net
        data = [monthly[m] for m in sorted(monthly)]
        summary = {
            "total_slips": len(slips),
            "total_gross_pay": round(total_gross, 2),
            "total_net_pay": round(total_net, 2),
        }
        return data, summary

    # ── SALES & CRM ──────────────────────────────────────
    def report_leads(self, params: dict):
        leads = self.get_leads()
        status_counts = {}
        territory_counts = {}
        for ld in leads:
            status_counts[ld.get("status") or "Unknown"] = status_counts.get(ld.get("status") or "Unknown", 0) + 1
            terr = ld.get("territory") or "Unspecified"
            territory_counts[terr] = territory_counts.get(terr, 0) + 1
        converted = status_counts.get("Converted", 0)
        summary = {
            "total_count": len(leads),
            "converted_count": converted,
            "open_count": status_counts.get("Open", 0) + status_counts.get("Lead", 0),
            "conversion_rate_pct": round(converted / len(leads) * 100.0, 2) if leads else 0.0,
            "status_breakdown": status_counts,
            "territory_breakdown": territory_counts,
        }
        return leads, summary

    def report_opportunities(self, params: dict):
        opps = self.get_opportunities()
        status_counts = {}
        stage_counts = {}
        total_value = 0.0
        for o in opps:
            status_counts[o.get("status") or "Unknown"] = status_counts.get(o.get("status") or "Unknown", 0) + 1
            stage = o.get("sales_stage") or "Unspecified"
            stage_counts[stage] = stage_counts.get(stage, 0) + 1
            total_value += self._f(o.get("opportunity_amount"))
        won = status_counts.get("Converted", 0)
        summary = {
            "total_count": len(opps),
            "open_count": status_counts.get("Open", 0),
            "won_count": won,
            "lost_count": status_counts.get("Lost", 0),
            "total_value": round(total_value, 2),
            "win_rate_pct": round(won / len(opps) * 100.0, 2) if opps else 0.0,
            "status_breakdown": status_counts,
            "stage_breakdown": stage_counts,
        }
        return opps, summary

    # ── PROCUREMENT ──────────────────────────────────────
    def report_suppliers(self, params: dict):
        suppliers = self.get_suppliers()
        group_counts = {}
        active = 0
        for s in suppliers:
            grp = s.get("supplier_group") or "Ungrouped"
            group_counts[grp] = group_counts.get(grp, 0) + 1
            if not s.get("disabled"):
                active += 1
        summary = {
            "total_count": len(suppliers),
            "active_count": active,
            "group_breakdown": group_counts,
        }
        return suppliers, summary

    # ── INVENTORY ────────────────────────────────────────
    def report_delivery_notes(self, params: dict):
        notes = self.get_delivery_notes()
        monthly = {}
        total_value = 0.0
        status_counts = {}
        for n in notes:
            status_counts[n.get("status") or "Unknown"] = status_counts.get(n.get("status") or "Unknown", 0) + 1
            val = self._f(n.get("grand_total"))
            total_value += val
            date_str = n.get("posting_date")
            if date_str:
                month = date_str[:7]
                monthly.setdefault(month, {"month": month, "value": 0.0, "count": 0})
                monthly[month]["value"] += val
                monthly[month]["count"] += 1
        data = [monthly[m] for m in sorted(monthly)]
        summary = {
            "total_count": len(notes),
            "total_value": round(total_value, 2),
            "status_breakdown": status_counts,
        }
        return data, summary

    def report_purchase_receipts(self, params: dict):
        receipts = self.get_purchase_receipts()
        monthly = {}
        total_value = 0.0
        status_counts = {}
        for r in receipts:
            status_counts[r.get("status") or "Unknown"] = status_counts.get(r.get("status") or "Unknown", 0) + 1
            val = self._f(r.get("grand_total"))
            total_value += val
            date_str = r.get("posting_date")
            if date_str:
                month = date_str[:7]
                monthly.setdefault(month, {"month": month, "value": 0.0, "count": 0})
                monthly[month]["value"] += val
                monthly[month]["count"] += 1
        data = [monthly[m] for m in sorted(monthly)]
        summary = {
            "total_count": len(receipts),
            "total_value": round(total_value, 2),
            "status_breakdown": status_counts,
        }
        return data, summary

    # ── PROJECTS ─────────────────────────────────────────
    def report_projects(self, params: dict):
        projects = self.get_projects()
        status_counts = {}
        total_progress = 0.0
        for p in projects:
            status_counts[p.get("status") or "Unknown"] = status_counts.get(p.get("status") or "Unknown", 0) + 1
            total_progress += self._f(p.get("percent_complete"))
        summary = {
            "total_count": len(projects),
            "open_count": status_counts.get("Open", 0),
            "completed_count": status_counts.get("Completed", 0),
            "avg_progress_pct": round(total_progress / len(projects), 2) if projects else 0.0,
            "status_breakdown": status_counts,
        }
        return projects, summary

    def report_tasks(self, params: dict):
        tasks = self.get_tasks()
        status_counts = {}
        priority_counts = {}
        for t in tasks:
            status_counts[t.get("status") or "Unknown"] = status_counts.get(t.get("status") or "Unknown", 0) + 1
            pri = t.get("priority") or "Unset"
            priority_counts[pri] = priority_counts.get(pri, 0) + 1
        completed = status_counts.get("Completed", 0)
        summary = {
            "total_count": len(tasks),
            "completed_count": completed,
            "open_count": status_counts.get("Open", 0) + status_counts.get("Working", 0),
            "overdue_count": status_counts.get("Overdue", 0),
            "completion_rate_pct": round(completed / len(tasks) * 100.0, 2) if tasks else 0.0,
            "status_breakdown": status_counts,
            "priority_breakdown": priority_counts,
        }
        return tasks, summary

    # ── SUPPORT ──────────────────────────────────────────
    def report_issues(self, params: dict):
        issues = self.get_issues()
        status_counts = {}
        priority_counts = {}
        type_counts = {}
        for i in issues:
            status_counts[i.get("status") or "Unknown"] = status_counts.get(i.get("status") or "Unknown", 0) + 1
            pri = i.get("priority") or "Unset"
            priority_counts[pri] = priority_counts.get(pri, 0) + 1
            it = i.get("issue_type") or "Uncategorized"
            type_counts[it] = type_counts.get(it, 0) + 1
        open_count = status_counts.get("Open", 0) + status_counts.get("Replied", 0)
        closed = status_counts.get("Closed", 0) + status_counts.get("Resolved", 0)
        summary = {
            "total_count": len(issues),
            "open_count": open_count,
            "closed_count": closed,
            "resolution_rate_pct": round(closed / len(issues) * 100.0, 2) if issues else 0.0,
            "status_breakdown": status_counts,
            "priority_breakdown": priority_counts,
            "type_breakdown": type_counts,
        }
        return issues, summary

    # ── NORMALIZERS (used by erpnext_sync.py) ────────────
    def normalize_to_financial_monthly(self, invoices: list) -> list:
        monthly_data = {}
        for inv in invoices:
            date_str = inv.get("posting_date")
            if not date_str:
                continue
            try:
                month_str = datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y-%m-01")
            except Exception:
                continue
            monthly_data.setdefault(month_str, {"revenue": 0.0, "expenses": 0.0})
            monthly_data[month_str]["revenue"] += self._f(inv.get("grand_total"))

        years = set()
        for inv in invoices:
            date_str = inv.get("posting_date")
            if date_str:
                years.add(int(date_str[:4]))

        for y in years:
            try:
                for pinv in self.get_purchase_invoices(year=y):
                    p_date = pinv.get("posting_date")
                    if not p_date:
                        continue
                    try:
                        p_month = datetime.strptime(p_date, "%Y-%m-%d").strftime("%Y-%m-01")
                    except Exception:
                        continue
                    monthly_data.setdefault(p_month, {"revenue": 0.0, "expenses": 0.0})
                    monthly_data[p_month]["expenses"] += self._f(pinv.get("grand_total"))
            except Exception:
                pass

        result = []
        for m, vals in monthly_data.items():
            rev, exp = vals["revenue"], vals["expenses"]
            gp = rev - exp
            margin = (gp / rev * 100.0) if rev > 0 else 0.0
            result.append({
                "month": m, "revenue": rev, "expenses": exp,
                "gross_profit": gp, "profit_margin_pct": round(margin, 2),
            })
        return result

    def normalize_to_client_snapshot(self, sales_orders: list) -> list:
        customer_first_seen = {}
        monthly_customers = {}
        monthly_revenue = {}
        for order in sales_orders:
            cust = order.get("customer")
            date_str = order.get("transaction_date")
            if not cust or not date_str:
                continue
            try:
                month_str = datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y-%m-01")
            except Exception:
                continue
            if cust not in customer_first_seen or date_str < customer_first_seen[cust]:
                customer_first_seen[cust] = date_str
            monthly_customers.setdefault(month_str, set()).add(cust)
            monthly_revenue[month_str] = monthly_revenue.get(month_str, 0.0) + self._f(order.get("grand_total"))

        result = []
        for m in sorted(monthly_customers):
            active = monthly_customers[m]
            new_count = sum(1 for c in active if customer_first_seen[c][:7] == m[:7])
            result.append({
                "month": m,
                "new_clients": new_count,
                "active_clients": len(active),
                "churned_clients": 0,
                "total_arr": round(monthly_revenue[m] * 12.0, 2),
            })
        return result
