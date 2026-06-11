---
title: Attendance Request
url: https://docs.frappe.io/hr/attendance-request
---

**Using the Attendance Request, employees can submit their attendance request for the days when their attendance wasn't marked due to various reasons such as on-site duty or work from home. Attendance Request can also be used for Attendance Regularization to overwrite existing attendance records.**

To access Attendance Request, go to:

> Home > Human Resources > Attendance > Attendance Request

## **1. Prerequisites**

Before creating an Attendance Request, it is advised that you create the following first:

* [Employee](https://docs.frappe.io/hr/employee)

## **2. How to create an Attendance Request**

1. Go to Attendance Request list, click on New.
2. Select Employee who wants to submit the Attendance Request.
3. Select From Date and To Date of Attendance Request.
4. You can enable **"Include Holidays"** if you want to mark attendance for holidays in between these dates too. This feature was introduced v15 onwards.
5. Select Reason and enter Explanation (optional).
6. Save and Submit.

![Attendance Request](https://frappehr.com/files/attendance-request.png)

> **Note 1:** You can check the 'Half Day' checkbox and enter the Date in case the attendance is for Half Day.

> **Note 2:** On submission of the same, Attendance documents will be created for the days you mentioned as shown.

![Attendance Request Submit](https://frappehr.com/files/attendance-request-submission.png)

As seen below, respective Attendance records are linked with the submitted Attendance Request.

![Attendance Request Linked](https://frappehr.com/files/attendance-request-link.png)

If you cancel the Attendance Request, the linked Attendance documents created will be cancelled as well.

![Attendance Request Cancelled](https://frappehr.com/files/attendance-request-cancelled.png)

## **3. Features**

### **3.1 Overwrite an existing Attendance record**

Consider a scenario where the auto-attendance tool marked an employee as Absent. If the employee wants to rectify their attendance, they can raise a request. On submission, the Attendance record will be updated:

![changed status](https://frappehr.com/files/changed%20status.png)

The submission can be controlled via [workflows](https://docs.erpnext.com/docs/v14/user/manual/en/setting-up/workflows) to undergo approvals.

### **3.2 Request for Attendance in Bulk**

Employees can also request for attendance for an entire month or week. On submission, attendance marking is skipped for holidays or leave days.

You can enable "Include Holidays" if you want to mark attendance for holidays too.

!

Attendance warnings are shown on the request dashboard for the same:

![attendance warnings](https://frappehr.com/files/attendance-warnings.png)

## **4. Related Topics**

1. [Employee Attendance Tool](https://docs.frappe.io/hr/employee-attendance-tool)
2. [Shift Management](https://docs.frappe.io/hr/shift-management)
3. [Auto Attendance](https://docs.frappe.io/hr/auto-attendance)
4. [Upload Attendance](https://docs.frappe.io/hr/upload-attendance)
5. [Attendance](https://docs.frappe.io/hr/attendance)
