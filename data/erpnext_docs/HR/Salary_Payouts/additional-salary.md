---
title: Additional Salary
url: https://docs.frappe.io/hr/additional-salary
---

**Additional Salary is something that an Employee receives from the company they work for, other than their usual pay.**

Frappe HR offers you a feature called Additional Salary to add or deduct ad hoc salary for a particular Employee while processing the Payroll. Some examples of Additional Salary could be Performance Bonus, Deputation Allowance, Arrears, Incentives, or other adjustments.

To access Additional Salary, go to:

> Home > Human Resources > Payroll > Additional Salary

## **1. Prerequisites**

Before creating an Additional Salary, it is advisable to create the following:

* [Employee](https://docs.frappe.io/hr/employee)
* [Salary Component](https://docs.frappe.io/hr/salary-component)

## **2. How to create an Additional Salary**

1. Go to the Additional Salary list, click on New.
2. Select Employee.
3. Select Salary Component.
4. Enter the Amount.
5. Enter the Payroll Date. If Payroll Date for Additional Salary is in the interval when the salary is processed, it will be added to the earnings/deduction.
6. Save and Submit.

Select the 'Overwrite Salary Structure Amount' checkbox to overwrite the Additional Salary component on the Salary Structure amount. Additionally, the 'Deduct Full Tax on Selected Payroll Date' checkbox can be selected if full tax needs to be deducted on the Additional Salary component for that particular payroll date.

![Additional Salary](https://frappehr.com/files/additional-salary.png)

## **3.Features**

### **3.1 Recurring Additional Salary**

This feature allows users to create an Additional Salary for a fixed interval. When 'Is Recurring' is checked you need to fill 'To Date' and 'From Date'. This will add or deduct the additional salary amount for this employee within the selected date range and it will be reflected in the Salary Slip for the employee. The Additional Salary will be repeated every month between 'From Date' and 'To Date' interval.

## **4. Related Topics**

1. [Retention Bonus](https://docs.frappe.io/hr/retention-bonus)
2. [Employee Incentive](https://docs.frappe.io/hr/employee-incentive)
3. [Salary Structure](https://docs.frappe.io/hr/salary-structure)
4. [Salary Structure Assignment](https://docs.frappe.io/hr/salary-structure-assignment)
5. [Payroll Entry](https://docs.frappe.io/hr/payroll-entry)
6. [Payroll Period](https://docs.frappe.io/hr/payroll-period)
