---
title: Holiday List Assignment
url: https://docs.frappe.io/hr/hr/leave-management/holiday-list-assignment
---

Previously, holiday list for employees and company was set in their respective master records. When new holiday list needs to be assigned to employees or company this fields is edited to set the new holiday list, this loses the historic holiday list assignment record. Additionally since only one list could be assigned at any given time, leave applications spanning two different holiday lists would not count holidays from the unassigned list.

To solve this problem, Holiday List Assignment feature is introduced. This will allows multiple holiday list assignments to employee and companies and preserves the historic assignment records.

##### Note

> Creating Holiday List Assignment for company or employee is mandatory if Frappe HR is installed on your site. ERPNext only users, can continue setting the list in the employee and company masters.

### 1. Create Holiday List Assignment

1. Set **Applicable For,** this could be either Company or Employee
2. Select the employee or company to assign the holiday list to
3. Select the holiday list to be assigned. You can edit the **Assignment Starts From** date, this is the date from which the selected holiday list is applicable for the employee or company and remains applicable till the end of the holiday list, unless another assignment is created.
   !

### 2. Switch List Assignment

1. In case the employee changes branches or department and new holiday list needs to be assigned, just create another holiday list assignment with appropriate **Assignment Starts From** date.
2. The most recent assignment as sorted by **Assignment Starts From** will be applicable

##### Note

> The holiday list assignment created for company will be the default list for all employees belonging to the company.

##### Note

> Employee level assignment is preferred over the default company level assignment.
