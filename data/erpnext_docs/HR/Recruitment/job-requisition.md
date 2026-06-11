---
title: Job Requisition
url: https://docs.frappe.io/hr/job-requisition
---

Job Requisition is an internal document raised to request a new hire. These requisitions are then converted to Job Openings or considered for budgeting while making the Staffing Plan.

To access Job Requisition, go to:

> **Home > Human Resources > Recruitment > Job Requisition**

## **1. Prerequisites**

Before creating a Job Requisition, you should create the following:

* [Designation](https://docs.frappe.io/hr/designation)
* [Department](https://docs.frappe.io/hr/department) (Optional)

## **2. How to create a Job Requisition**

1. Go to the Job Requisition list, and click on New.
2. Enter the Designation you want to place the request for.
3. Enter the No of Positions, Expected Compensation, Company, and Department (optional).
4. Select the employee who is applying for the requisition in the Requested By field.
5. Optionally, you can set the **Expected By** date.
6. The Job Description will be fetched from the Designation. If you want to add additional information for the opening, you can do so here.
7. Save.
8. By default, the status will be Pending. You can set up [workflows](https://docs.erpnext.com/docs/v14/user/manual/en/setting-up/workflows) to change the status to Open & Approved.

![Job Requisition](https://frappehr.com/files/job_req.png)

![Job Requisition List](https://frappehr.com/files/job_req_list.png)

## **3. Actions**

### **3.1 Create Job Opening**

Once the Job Requisition is **Open & Approved**, you can create a new Job Opening against the Job Requisition or associate an existing one.

![create job opening](https://frappehr.com/files/create-job-openingafcb2d.gif)

### **3.2 Associate Job Opening**

If you already have an existing Open Job Opening for that designation, you can associate it with the requisition.

![Associate Job Opening](https://frappehr.com/files/associate-job-opening.gif)

Once the Job Opening is closed, the Job Requisition's status is updated to **Filled**

## **4. Features**

### **4.1 Check existing Employee Referrals**

If there is an existing Employee Referral for that designation, you might want to consider referrals instead of creating new openings. A banner is visible on the Job Requisition form with the links to these employee referrals in these cases.

![employee referral](https://frappehr.com/files/employee-referral.png)

### **4.2 Get Job Requisitions in Staffing Plan**

While creating a budget with the Staffing Plan, you can fetch the existing **Pending** or **Open & Approved** Job Requisitions.

![Get Job Requisition](https://frappehr.com/files/get-job-req8e955b.gif)

### **4.3 Time to Fill Metric**

Time to Fill measures the number of days it takes to fill an open position, from the date a job requisition is posted to the date when it is marked as Filled. This metric is auto-calculated and set in Job Requisition.

The Average Time to Fill is also displayed on the Hiring Dashboard:

![time to fill](https://frappehr.com/files/time-to-fill.png)

## **5. Related Topics**

1. [Job Opening](https://docs.frappe.io/hr/job-opening)
2. [Staffing Plan](https://docs.frappe.io/hr/staffing-plan)
