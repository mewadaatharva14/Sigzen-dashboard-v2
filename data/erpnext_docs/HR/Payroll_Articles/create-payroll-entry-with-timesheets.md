---
title: Create Payroll Entry With Timesheets
url: https://docs.frappe.io/hr/create-payroll-entry-with-timesheets
---

**Use Case:** An employee's overtime is recorded using timesheets, and the employee needs to be compensated for the same during payroll apart from his usual salary.

**Steps:**

1. Create an Employee.
2. Create a Salary Component called "Overtime" of type Earning.

!

3. Create a Salary Structure and include "Overtime" with amount set to 0.
4. In the Salary Structure itself, select the "Salary Slip Based on Timesheet" checkbox, select Salary Component as "Overtime" and enter the Hour Rate.

!

5. Submit the Salary Structure and assign this Salary Structure to an Employee via Salary Structure Assignment.

!

6. Create Timesheets for this Employee through the Timesheet DocType.

!

!

In the above example shown, the Employee has worked overtime for a total of 8 hours in the month of January.

7. Create a new Payroll Entry for the month of January and select the "Salary Slip Based on Timesheet" checkbox. Save. Click on the "Get Employees" button. Next, click on "Create Salary Slips".

The Salary Slip of the employee will fetch all the timesheets (if any) of that employee created for that particular month and calculate the Overtime Component in the Salary Slip accordingly.

!

!
