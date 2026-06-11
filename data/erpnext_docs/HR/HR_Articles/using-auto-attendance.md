---
title: Using Auto Attendance
url: https://docs.frappe.io/hr/using-auto-attendance
---

Frappe HR allows us to Mark Attendance automatically depending upon the Employee Checkin records.

A. Create or import Employee Checkin:

!

1. Set the time carefully for log type **IN** and **OUT.**
2. For Log Type **IN** time should be greater than **Shift Type Start Time - Begin check-in before shift time**
3. For Log Type **OUT** time should be less Than **Shift Type End Time + Allow check-out after shift end time.**
4. Then only Shift would be mapped properly and your Checkin is valid.

B. Check your shift type:

!

1. Set **Process Attendance After** (Attendance will be marked Only after this date)
2. Set **Last Sync of Checkins** (It is the time before which all the checkin records will be considered. Note: If it is less than shift end Time then it will not consider that day's checkin because it means that shift is not over yet)

C. Click on Mark Auto Attendance to check whether it is working

Note: The scheduler will run the process to mark attendance automatically every hour. But after uploading or creating check-ins you need to check your **Process Attendance After and Last Sync of Checkin** in **Shift Type**.
