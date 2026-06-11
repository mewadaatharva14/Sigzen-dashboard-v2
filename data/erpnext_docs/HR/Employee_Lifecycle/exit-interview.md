---
title: Exit Interview
url: https://docs.frappe.io/hr/exit-interview
---

> Introduced in Version 14

**An Exit Interview is a survey interview conducted for an Employee who is leaving the organization.**

In Frappe HR, to access the Exit Interview, go to:

> Human Resources > Employee Exit > Exit Interview

## **1. Prerequisites**

Before creating an Exit Interview, it is advisable that you create the following documents:

* [Employee](https://docs.frappe.io/hr/employee)
* [Department](https://docs.frappe.io/hr/department)
* [Designation](https://docs.frappe.io/hr/designation)

Exit Interview is created for an Employee who has resigned or is being terminated. Hence it is mandatory to set the **Relieving Date** for the Employee in the Employee master.

## **2. How to create an Exit Interview**

1. Go to: Exit Interview > New.
2. Select the Employee. Once the Employee is selected, the corresponding Employee information such as Department, Designation, Reports To, Date of Joining, Relieving Date, etc. will automatically get fetched.
3. The status will be Pending by default.
4. When the Interview is scheduled, set the Date, select the Interviewers, and change status to Scheduled.
5. You can record the Interview Summary during the Interview.
6. Once the Exit Interview is completed, you can change the status to Completed. Final Decision can be recorded on completion (Employee Retained / Exit Confirmed).
7. Submit. On submission, the Exit Interview Date will be updated in the Employee master.

!

## **3. Features**

### **3.1 Sending Exit Questionnaire**

During Employee Exits, companies conduct surveys by sending a questionnaire to the Employee to get feedbacks for improvement and reviews. Here is how you can conduct exit surveys:

1. Since exit questionnaires will differ from company to company, you can create your own Questionnaire as a Custom [DocType](https://frappehr.com/docs/v14/user/manual/en/customize-erpnext/doctype). For eg, we have created a sample custom doctype for the same:

!
2. After creating the questionnaire, you can create a [Web Form](https://frappehr.com/docs/v14/user/manual/en/website/web-form) for the same so that these forms can be sent to employees.
3. Link the Web Form in HR Settings. A default notification email template is already provided by Frappe HR which is linked in HR Settings.

!
4. In the Exit Interview document, you can see a button **Send Exit Questionnaire**. This will send an email to the Employee with a link to the web form as per the email template set in HR Settings.

!
5. Once your employee fills up this questionnaire, you can link it to the Exit Interview document.

!
6. If you want to send Exit Questionnaires in bulk to multiple employees, you can select the employees from the Exit Interview list view and click on **Actions > Send Exit Questionnaire**. This will send the exit questionnaire emails and provide you with a summary of the emails sent.

!

## **4. Related Topics**

1. [Employee](https://docs.frappe.io/hr/employee-separation)
2. [Employee Separation](https://docs.frappe.io/hr/employee-separation)
3. [Employee Exits Report](https://docs.frappe.io/hr/human-resources-reports#5-employee-exits)
