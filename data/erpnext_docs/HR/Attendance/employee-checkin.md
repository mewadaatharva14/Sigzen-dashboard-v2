---
title: Employee Checkin
url: https://docs.frappe.io/hr/employee-checkin
---

Employee Checkin is used to keep a log of all the check-ins and check-outs of an employee in the organization. Most organizations use this for attendance, shift management, and working hours calculations.

## **1. Prerequisites**

To create an Employee Checkin, you need to first create:

* [Employee](https://docs.frappe.io/hr/employee)

If you want shifts to be determined in employee checkins and want to process auto-attendance, then you need to create the following documents too:

* [Shift Type](https://docs.frappe.io/hr/shift-type)
* [Shift Assignment](https://docs.frappe.io/hr/shift-assignment) or set a default shift in Employee master.

## **2. How to create an Employee Checkin**

#### **2.1 Creating logs manually**

To create a new Employee Checkin go to:

> **Human Resources > Attendance > Employee Checkin**

1. Click on New.
2. Select the Employee.
3. Set the date and time for the log.
4. Set Log Type as IN/OUT.
5. Save.
6. If you have set up shifts and shift assignments, the Employee Checkin will set the appropriate shift in which the timestamp falls after saving. If you have forgotten to assign a shift, causing the system to pick up the wrong one, you can re-fetch it by clicking on the 'Fetch Shift' button, as long as attendance has not already been marked for the same.
7. You can enable *Skip Auto Attendance* to skip that record while marking attendance.
8. You can also capture the location from where the employee has checked in or the Biometric Device ID.

!

If auto attendance is enabled, the attendance record marked for a set of check-ins will be linked to the document later.

#### **2.2 Integrating Frappe HR with Biometric Devices**

If you are using a Biometric Device to log employee check-ins and check-outs you can use it to create records in Frappe HR. You can read more about this [here](https://docs.frappe.io/hr/integrating-frappe-hr-with-biometric-attendance-devices).

## **3. Features**

### **3.1 Geolocation Tracking**

You can also track geolocation in employee checkins. To enable this, go to HR Settings and enable "**Allow Geolocation Tracking**"

!

You can then click on the "**Fetch Geolocation**" button in the check-in form to fetch your current location

![geolocation-desk](https://frappehr.com/files/geolocation-desk.gif "geolocation-desk.gif")

It geolocation tracking has been enabled, it will be automatically captured while checking in from the mobile app too

![geolocation-mobile](https://frappehr.com/files/geolocation-mobile.gif "geolocation-mobile.gif")

### **3.2 Checkin log indicator**

Employee checkins fetch appropriate shift while saving based on the time of checkin or checkout log. If there is no active shift asssociated for the time of log, the employee checkin log is marked as **Off-Shift** indicating the lack of associated shift. Since auto-attendance works based on shift, these checkin logs are excluded while marking auto-attendance.

!
