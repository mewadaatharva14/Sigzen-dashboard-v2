---
title: Department Wise Leave Approval In Erpnext
url: https://docs.frappe.io/hr/department-wise-leave-approval-in-erpnext
---

Any user with role, "Leave Approver" should be only able to access leave applications of those employees that belong in their department. This is a common use-case in most companies, and with some quick configurations, we can achieve it in Frappe HR.

**In company "SX4", let's consider Chris as the Leave Approver for department, "Research And Development". With this configuration, Chris will only be able to view Leave Applications raised by his department.**

1. Under Role Permissions Manager, provide this role with access of Department DocType

[![18](https://discuss.erpnext.com/uploads/default/original/3X/a/8/a8242a2ee2e82cd47b76d264eed601f474bd5142.png)](https://discuss.erpnext.com/uploads/default/original/3X/a/8/a8242a2ee2e82cd47b76d264eed601f474bd5142.png)

2. Create the user in Frappe HR with Role as “Leave Approver”, and Employee In our example, this is Chris.

[![image](https://discuss.erpnext.com/uploads/default/original/3X/a/8/a8242a2ee2e82cd47b76d264eed601f474bd5142.png)](https://discuss.erpnext.com/uploads/default/original/3X/4/c/4c9dd72505cccbb8d35bb323d1e63fd960f6cfb1.png)

!

3. Now, create the necessary user permissions as per Company, Department, and Employee.

[![image](https://discuss.erpnext.com/uploads/default/original/3X/4/a/4a100efbc5a42bdee7817fdc89e9d4f5f2f60227.png)](https://discuss.erpnext.com/uploads/default/original/3X/4/a/4a100efbc5a42bdee7817fdc89e9d4f5f2f60227.png)

While adding the "Employee" permission for Chris, just keep Leave Application unchecked, so that Chris has access to only view other employees

!

4. Department: Set a “Leave Approver” in the Department master

[![image](https://discuss.erpnext.com/uploads/default/original/3X/5/c/5cabba46854752f07d9ed269ab7a3b0cf53baf26.png)](https://discuss.erpnext.com/uploads/default/original/3X/5/c/5cabba46854752f07d9ed269ab7a3b0cf53baf26.png)

---

Now, let’s say, we have an employee called Pepper who works in the “Research and Development” Department.

[![image](https://discuss.erpnext.com/uploads/default/original/3X/8/a/8a3ebb9644069224c31180fbbd816775f54aea2e.png)](https://discuss.erpnext.com/uploads/default/original/3X/8/a/8a3ebb9644069224c31180fbbd816775f54aea2e.png)

6. Pepper fills in a leave application.

[![image](https://discuss.erpnext.com/uploads/default/original/3X/c/f/cf8418b1278c5bd6c89ff5a86a1412049e7bd109.png)](https://discuss.erpnext.com/uploads/default/original/3X/c/f/cf8418b1278c5bd6c89ff5a86a1412049e7bd109.png)

7. When the Leave Approver, Chris, logins, he can only access the leaves raised by employees of his department.

(https://dl.dropboxusercontent.com/s/lfqeaivl50ixt5l/la-dept-1.gif?dl=0)

8. Meanwhile, when we login via System Manager, there are few other Leave Applications in the list, too.

!

PS. We have assumed that the reader knows how to manage different leaves and allocations in Frappe HR. To explore that again, click [here](https://erpnext.com/docs/user/manual/en/human-resources)

Thanks for your time! ;-)
