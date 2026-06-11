---
title: Employee Performance Feedback
url: https://docs.frappe.io/hr/employee-performance-feedback
---

**The Employee Performance Feedback document allows you to capture 360° feedback on the employee's performance. Reviewers can rate the employee based on some criteria set up in the Appraisal Template and add a written feedback assessing the employee's performance throughout the cycle.**

To create an Employee Performance Feedback, go to:

> **Home > Human Resources > Performance > Employee Performance Feedback**

## **1. Prerequisites**

Before creating a Performance Feedback, you should create the following:

* [Appraisal Template](https://docs.frappe.io/hr/appraisal-template)
* [Appraisal Cycle](https://docs.frappe.io/hr/appraisal-cycle)
* [Appraisal](https://docs.frappe.io/hr/appraisal)

## **2. How to create an Employee Performance Feedback**

### **2.1 From the Appraisal**

You can directly give feedback to an employee from their Appraisal document. If you have the required permissions, you can submit the performance feedback right from this view by clicking on the **New Feedback** button.

![add feedback](https://frappehr.com/files/add-feedback.png)

For more details about the feedback timeline check [Appraisal](https://docs.frappe.io/hr/appraisal#32-feedback)

### **2.2 Direct creation**

1. Go to the Employee Performance Feedback list, and click on New.
2. Select the Employee.
3. If your session user is linked to some employee, that employee will be auto-selected as the reviewer. Else you can select the reviewer.
4. Select the Appraisal document against which you want to give the feedback.
5. The feedback criteria set in the Appraisal Template in the Appraisal document will be pulled into the Feedback Ratings child table.
6. You can rate the employee for each criteria and add your feedback under the feedback.
7. Save and Submit.

![perf feedback](https://frappehr.com/files/perf-feedback.png)

## **3. Features**

### **3.1 Average Feedback Score**

On submitting a feedback, the average feedback score will be updated in the linked appraisal. Cancelling the feedback will update the score again.

### **3.2 Approvals for Appraisals**

If you don't want employees to submit feedback directly, You can also set up a [Workflow](https://docs.erpnext.com/docs/v14/user/manual/en/setting-up/workflows) for approvals before submission.

## **3. Related Topics**

1. [Appraisal](https://docs.frappe.io/hr/appraisal)
