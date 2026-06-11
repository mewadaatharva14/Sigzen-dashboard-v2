// frontend/lib/erpnext-api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ERPNextResponse<T = any> {
  data: T;
  summary: Record<string, any>;
  source: string;
  error?: string;
}

export async function getERPNextStatus(): Promise<{ status: string; user?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/erpnext/status`);
    if (!res.ok) throw new Error("Offline");
    return await res.json();
  } catch (error) {
    return { status: "offline", error: String(error) };
  }
}

// Accounting
export async function getSalesInvoices(year?: number): Promise<ERPNextResponse> {
  try {
    const url = year ? `${API_BASE}/api/erpnext/accounting/sales-invoices?year=${year}` : `${API_BASE}/api/erpnext/accounting/sales-invoices`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

export async function getPurchaseInvoices(year?: number): Promise<ERPNextResponse> {
  try {
    const url = year ? `${API_BASE}/api/erpnext/accounting/purchase-invoices?year=${year}` : `${API_BASE}/api/erpnext/accounting/purchase-invoices`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

export async function getPayments(year?: number): Promise<ERPNextResponse> {
  try {
    const url = year ? `${API_BASE}/api/erpnext/accounting/payments?year=${year}` : `${API_BASE}/api/erpnext/accounting/payments`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

export async function getJournalEntries(year?: number): Promise<ERPNextResponse> {
  try {
    const url = year ? `${API_BASE}/api/erpnext/accounting/journal-entries?year=${year}` : `${API_BASE}/api/erpnext/accounting/journal-entries`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

// Inventory
export async function getStockSummary(): Promise<ERPNextResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/erpnext/inventory/stock`);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

export async function getItems(): Promise<ERPNextResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/erpnext/inventory/items`);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

// Sales
export async function getSalesOrders(year?: number): Promise<ERPNextResponse> {
  try {
    const url = year ? `${API_BASE}/api/erpnext/sales/orders?year=${year}` : `${API_BASE}/api/erpnext/sales/orders`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

export async function getQuotations(year?: number): Promise<ERPNextResponse> {
  try {
    const url = year ? `${API_BASE}/api/erpnext/sales/quotations?year=${year}` : `${API_BASE}/api/erpnext/sales/quotations`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

// Purchase
export async function getPurchaseOrders(year?: number): Promise<ERPNextResponse> {
  try {
    const url = year ? `${API_BASE}/api/erpnext/purchase/orders?year=${year}` : `${API_BASE}/api/erpnext/purchase/orders`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

// HR
export async function getEmployees(): Promise<ERPNextResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/erpnext/hr/employees`);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

export async function getSalaryData(year?: number): Promise<ERPNextResponse> {
  try {
    const url = year ? `${API_BASE}/api/erpnext/hr/salary?year=${year}` : `${API_BASE}/api/erpnext/hr/salary`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    return { data: [], summary: {}, source: "offline", error: String(error) };
  }
}

// ── SESSION-BASED FETCHERS ──────────────────────────────────────────
// These read live ERP data through the UI-created session (no hardcoded
// .env credentials). Path pattern: /api/session/{sessionId}/{endpoint}.
// All fail-safe: return an offline-shaped response on any error.

const OFFLINE: ERPNextResponse = { data: [], summary: {}, source: "offline" };

async function fetchSession(path: string): Promise<ERPNextResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/session/${path}`);
    return await res.json();
  } catch (error) {
    return { ...OFFLINE, error: String(error) };
  }
}

function withYear(base: string, year?: number): string {
  return year ? `${base}?year=${year}` : base;
}

// Accounting
export async function getSessionSalesInvoices(sessionId: string, year?: number): Promise<ERPNextResponse> {
  return fetchSession(withYear(`${sessionId}/accounting/sales-invoices`, year));
}

export async function getSessionPurchaseInvoices(sessionId: string, year?: number): Promise<ERPNextResponse> {
  return fetchSession(withYear(`${sessionId}/accounting/purchase-invoices`, year));
}

export async function getSessionPayments(sessionId: string, year?: number): Promise<ERPNextResponse> {
  return fetchSession(withYear(`${sessionId}/accounting/payments`, year));
}

export async function getSessionJournalEntries(sessionId: string, year?: number): Promise<ERPNextResponse> {
  return fetchSession(withYear(`${sessionId}/accounting/journal-entries`, year));
}

// Sales
export async function getSessionSalesOrders(sessionId: string, year?: number): Promise<ERPNextResponse> {
  return fetchSession(withYear(`${sessionId}/sales/orders`, year));
}

export async function getSessionQuotations(sessionId: string, year?: number): Promise<ERPNextResponse> {
  return fetchSession(withYear(`${sessionId}/sales/quotations`, year));
}

// Purchase
export async function getSessionPurchaseOrders(sessionId: string, year?: number): Promise<ERPNextResponse> {
  return fetchSession(withYear(`${sessionId}/purchase/orders`, year));
}

// Inventory
export async function getSessionStock(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/inventory/stock`);
}

export async function getSessionItems(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/inventory/items`);
}

// HR
export async function getSessionEmployees(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/hr/employees`);
}

export async function getSessionSalary(sessionId: string, year?: number): Promise<ERPNextResponse> {
  return fetchSession(withYear(`${sessionId}/hr/salary`, year));
}

// ── DEEP-DIVE MODULES (current-state, not year-filtered) ────────────
// Sales & CRM
export async function getSessionLeads(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/sales/leads`);
}

export async function getSessionOpportunities(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/sales/opportunities`);
}

// Procurement
export async function getSessionSuppliers(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/procurement/suppliers`);
}

// Inventory
export async function getSessionDeliveryNotes(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/inventory/delivery-notes`);
}

export async function getSessionPurchaseReceipts(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/inventory/purchase-receipts`);
}

// Projects
export async function getSessionProjects(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/projects/list`);
}

export async function getSessionTasks(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/projects/tasks`);
}

// Support
export async function getSessionIssues(sessionId: string): Promise<ERPNextResponse> {
  return fetchSession(`${sessionId}/support/issues`);
}
