---
title: Employee State Insurance (ESIC)
url: https://docs.frappe.io/hr/india-payroll/employee-state-insurance
---

# Employee State Insurance (ESIC)

The Employees' State Insurance scheme (ESI) is a mandatory social security scheme under the **ESI Act, 1948**. India Payroll automates ESI contribution calculation and injection into Salary Slips.

---

## 1. How to Enable

1. Go to **Payroll Settings → India Payroll** tab.
2. Check **Enable ESIC Deduction**.
3. Optionally enter your **ESIC Registration Number** (appears on the ESIC Register report).
4. Save.

![Payroll Settings — Enable ESIC](https://file+.vscode-resource.vscode-cdn.net/Users/deepesh/frappe/my-bench/apps/india_payroll/docs/assets/payroll-settings-esic-enabled.png)

---

## 2. How It Works

The hook (`apply_esi`) runs on `Salary Slip.before_save`:

```
Salary Slip (before_save)
    │
    ├─ enable_esic in Payroll Settings? → NO → skip
    ├─ salary_structure set? → NO → skip
    │
    ├─ is_person_with_disability (Employee)?
    │       YES → wage_ceiling = ₹25,000
    │       NO  → wage_ceiling = ₹21,000
    │
    ├─ gross_pay > wage_ceiling? → YES → remove any ESI row, skip
    │
    └─ esi = gross_pay × 4%
         inject / replace "Employee State Insurance" deduction row
         recalculate total_deduction, net_pay
```

The single contribution row covers **both** shares:

| Share | Rate |
| --- | --- |
| Employee contribution | 0.75% of gross wages |
| Employer contribution | 3.25% of gross wages |
| **Combined (on slip)** | **4.00% of gross wages** |

> **Note:** The employer's 3.25% is shown as a single line on the slip for transparency. It is part of the CTC and not a separate payable deduction from the employee's perspective.

---

## 3. Wage Ceiling

| Category | Monthly Gross Wage Ceiling |
| --- | --- |
| General employees | ₹21,000 |
| Persons with Disability (PwD) | ₹25,000 |

The PwD status is read from the `is_person_with_disability` checkbox on the Employee master.

* Employees **at or below** the ceiling are covered (ESI row injected).
* Employees **above** the ceiling are not covered (ESI row removed if previously present).

---

## 4. Persons with Disability

To apply the higher ₹25,000 ceiling for a PwD employee:

1. Open the **Employee** document.
2. Check **Is Person with Disability**.

![Employee — Is Person with Disability](https://file+.vscode-resource.vscode-cdn.net/Users/deepesh/frappe/my-bench/apps/india_payroll/docs/assets/employee-pwd.png)

The hook reads this field on every slip save, so changing the flag mid-year takes effect on the next payroll run.

## 5. ESIC Card Number

The **ESIC Card No** (IP Number) field is a standard Frappe HR field on the Employee master. It is displayed in the **ESIC Register** report and should be filled for all covered employees for the report to be complete.

---
