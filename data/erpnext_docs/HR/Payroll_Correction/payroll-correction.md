---
title: Payroll Correction
url: https://docs.frappe.io/hr/payroll-correction
---

The feature ensures accurate payroll calculations by allowing users to reverse a portion of LWP days, automatically recalculating earnings and deductions based on the reversal.

How to Use

Step 1: Navigate to Payroll Correction

1. Go to HR > Payroll > Payroll Correction.
2. Click New to create a new Payroll Correction entry.
   Step 2: Select Employee and Payroll Period

* Choose the Employee whose LWP needs correction.
* Select the Payroll Period.
* The system will fetch available Salary Slips with LWP and absent days applied.

Step 3: Select the Month for LWP Reversal

* In the "Select Month for LWP Reversal" field, choose the month from the dropdown.
* Once that is done system fetches:
  + Salary Slip Reference
  + Absent Days
  + LWP Days
  + Total Working Days
  + Total LWP Applied

Step 4: Enter the number of days to reverse in the Days to Reverse field.

Step 5: Save

* Upon save arrear details will be populated for Earnings, Deductions and Accrued Benefits

Step 5: Submit the Payroll Correction

* • Once validated, submit the document.
* • The system will:
  + Create Additional Salary Entries against earnings and deductions for the reversed amount.
  + Record accruals in Employee Benefit Ledger
