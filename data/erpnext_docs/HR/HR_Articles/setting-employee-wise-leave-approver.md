---
title: Setting Employee Wise Leave Approver
url: https://docs.frappe.io/hr/setting-employee-wise-leave-approver
---

**Use Case:** Need to set up one Leave Approver per Employee.

**Steps:**

1. Go to the Employee's master.
2. In "Attendance and Leave Details" section, select the Leave Approver for that particular Employee.

!

3. Assign a Leave Policy to the Employee through the Employee master and Grant leaves through Leave Period.
4. Create a new Leave Application for the Employee. The system automatically fetches the Leave Approver set for that particular Employee.

!

**Note:** In case you have set a Department for that Employee, and Leave Approvers are also set in that particular Department, then those Leave Approvers will also be fetched in the Leave Application. However, the default Leave Approver will always be the one set in the Employee master.

For example, a Leave Approver is set in the Department.

!

Now, if an Employee belonging to this Department creates a Leave Application, all the Leave Approvers set for this Department will also be fetched in his Leave Application.

!
