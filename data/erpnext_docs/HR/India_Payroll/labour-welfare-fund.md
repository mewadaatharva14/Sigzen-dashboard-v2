---
title: Labour Welfare Fund (LWF)
url: https://docs.frappe.io/hr/india-payroll/labour-welfare-fund
---

# Labour Welfare Fund (LWF)

The Labour Welfare Fund (LWF) is a statutory contribution collected by state governments under their respective Labour Welfare Fund Acts. India Payroll automates LWF deduction on Salary Slips based on the employee's work state and the payroll month.

> LWF amounts are **flat fixed amounts per employee**, not percentages of salary.

---

## 1. How to Enable

1. Go to **Payroll Settings → India Payroll** tab.
2. Check **Enable LWF Deduction**.
3. Save.

![Payroll Settings — Enable LWF](https://file+.vscode-resource.vscode-cdn.net/Users/deepesh/frappe/my-bench/apps/india_payroll/docs/assets/payroll-settings-lwf-enabled.png)

---

## 2. How It Works

The hook (`apply_lwf`) runs on `Salary Slip.before_save`:

```
Salary Slip (before_save)
    │
    ├─ enable_lwf in Payroll Settings? → NO → skip
    ├─ salary_structure set? → NO → skip
    │
    ├─ employment_state from SSA → not in LWF_STATE_CONFIG? → remove stale row, skip
    │
    ├─ Employee.lwf_exempted = True? → remove stale row, skip
    │
    ├─ frequency = monthly? → deduct every month
    ├─ frequency = half-yearly? → deduct only in June or December
    └─ frequency = annual? → deduct only in December
         │
         inject / replace "Labour Welfare Fund" deduction row (flat amount)
         recalculate total_deduction, net_pay
```

---

## 3. Deduction Frequency

| Frequency | Deduction Months | States |
| --- | --- | --- |
| **Monthly** | Every month | Haryana, Kerala, Punjab, Chandigarh |
| **Half-yearly** | June + December | Chhattisgarh, Delhi, Goa, Gujarat, Madhya Pradesh, Maharashtra, Odisha, West Bengal |
| **Annual** | December only | Andhra Pradesh, Karnataka, Tamil Nadu, Telangana |

---

## 4. State-wise Rate Table

All amounts are flat fixed contributions per employee per deduction period.

### Monthly States

| State | Employee (₹) | Employer (₹) |
| --- | --- | --- |
| Haryana | 34 | 68 |
| Kerala | 50 | 50 |
| Punjab | 5 | 20 |
| Chandigarh | 5 | 20 |

### Half-Yearly States (June + December)

| State | Employee (₹) | Employer (₹) |
| --- | --- | --- |
| Chhattisgarh | 15 | 45 |
| Delhi | 0.75 | 2.25 |
| Goa | 60 | 180 |
| Gujarat | 6 | 12 |
| Madhya Pradesh | 10 | 30 |
| Maharashtra | 25 | 75 |
| Odisha | 20 | 40 |
| West Bengal | 3 | 30 |

### Annual States (December only)

| State | Employee (₹) | Employer (₹) |
| --- | --- | --- |
| Andhra Pradesh | 30 | 70 |
| Karnataka | 50 | 100 |
| Tamil Nadu | 20 | 40 |
| Telangana | 2 | 5 |

> **Only the employee share is deducted on the salary slip.** The employer share is visible in the LWF Register report for remittance purposes.

---

## 5. Employment State

LWF is determined by the **Employment State** set on the **Salary Structure Assignment**. The same field is used by Professional Tax, so it only needs to be set once per assignment.

---

## 6. Per-Employee Exemptions

Some employees may be exempt from LWF by local law (e.g., contract workers, employees above a certain grade in specific states, or directors). India Payroll provides a per-employee exemption flag.

### How to Exempt an Employee

1. Open the **Employee** document.
2. Go to the **Labour Welfare Fund** section.
3. Check **LWF Exempted**.
4. Fill in **LWF Exemption Reason** (optional, for audit trail).

![Employee — LWF Exempted](https://file+.vscode-resource.vscode-cdn.net/Users/deepesh/frappe/my-bench/apps/india_payroll/docs/assets/employee-lwf-exempted.png)

> **Key behaviour:** The `lwf_exempted` flag is **never auto-overridden** by the hook. Only an HR user with write access to the Employee document can change it. This ensures manual exemptions are preserved across all payroll runs.

---
