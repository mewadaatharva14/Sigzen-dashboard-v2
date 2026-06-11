---
title: Employee Advance
url: https://docs.frappe.io/hr/employee-advance
---

**Sometimes employees go outside for company's work and company pays some amount for their expenses in advance. This is when the employee can create an Employee Advance form where details such as the Purpose of Expense and Expense Amount can be recorded.**

Once the Employee Advance is created by the Employee, the Expense Approver can submit the advance record after verification. After Employee Advance gets submitted, the accountant releases the payment and makes the Payment Entry.

To access Employee Advance, go to:

> Human Resources > Expense Claims > Employee Advance

## **1. Prerequisites**

1. [Employee](https://docs.frappe.io/hr/employee)
2. [Department](https://docs.frappe.io/hr/department)
3. [Chart of Accounts](https://docs.erpnext.com/docs/user/manual/en/chart-of-accounts)

## **2. How to create an Employee Advance**

1. Go to: Employee Advance > New.
2. Select Employee to whom you need to give the advance.
3. Enter the Purpose and Advance Amount.
4. Under the Accounting section, select Mode of Payment. Advance Account will be fetched from the Default Employee Advance Account of your Company.
5. Save.

!

> Note: The Employee can only Save the Employee Advance but cannot Submit it. It can be only submitted by the Expense Approver.

### **2.1 Statuses**

These are the statuses that are automatically set for Employee Advance.

* **Draft**: A draft is saved but yet to be submitted.
* **Paid**: Advance has been Paid to the employee and a [Payment Entry](https://docs.erpnext.com/docs/user/manual/en/payment-entry) has been submitted.
* **Unpaid**: Advance is not paid out to the employee yet. A Payment Entry is not created against the advance.
* **Claimed**: After the advance is paid, the employee has claimed the entire *Paid Amount* via [Expense Claim](https://docs.frappe.io/hr/expense-claim).
* **Returned**: After the advance is paid, the employee has returned the entire *Paid Amount* and a return entry is submitted via Payment Entry/Journal Entry.
* **Partly Claimed and Returned**: After the advance is paid, the employee has partially claimed the *Paid Amount* via Expense Claim and returned the remaining amount via a submitted Payment Entry/Journal Entry.
* **Cancelled**: The Advance is cancelled due to any reason.

## **3. Features**

### **3.1 Employee Advance Submission**

Employee Advance record can be created by any Employee but they cannot submit the record.

After saving Employee Advance, Employee should [Assign document to Approver](https://docs.erpnext.com/docs/v14/user/manual/en/using-erpnext/assignment). On assignment, approving user will also receive email notification. To automate email notification, you can also setup [Email Alert](https://docs.erpnext.com/docs/user/manual/en/notifications).

After verification, the Expense Approver can Submit (Accept) the Employee Advance form or Reject the request.

### **3.2 Make Payment Entry**

##### **Employee Advance via Payment Entry**

After submission of Employee Advance record, accounts user will be able to create a [Payment Entry](https://docs.erpnext.com/docs/user/manual/en/payment-entry) using the 'Create' button.

The Payment Entry will look like following:

!

#### **Employee Advance Payment via Journal Entry**

Alternatively, a [Journal Entry](https://docs.erpnext.com/docs/user/manual/en/journal-entry) can also be created against the Employee Advance.

![Employee Advance Payment via Journal Entry](https://frappehr.com/files/employee-advance-journal-entry1.png)

> Note: Make sure the Party Type is selected as Employee and the Reference Type is selected as Employee Advance.

![Employee Advance Payment via Journal Entry](https://frappehr.com/files/employee-advance-journal-entry2.png)

#### **Employee Advance is Paid**

On submission of the Payment Entry/Journal Entry, the paid amount and status will be updated in Employee Advance record.

### **3.3 Adjust Advances on Expense Claim**

Later when the employee claims the expense, an advance record can be fetched in the [Expense Claim](https://docs.frappe.io/hr/expense-claim) and linked to the claim record.

### **3.4 Return Amount**

When advance is paid to an Employee, there are three situations:

* The amount may be unused
* All of it may be used
* Some part may be used

Create the Employee Advance, create a payment entry to indicate that the amount is paid.

* If amount is unused, click on the **Return** button to return the paid Advance amount ![Return Button](https://frappehr.com/files/advance-return-button.png)
* If all of the advance is used, it will reflect in the Claimed Amount field
* If only some amount is claimed and rest is returned, the returned amount will be shown in the 'Returned Amount' field. ![Return advance Amount](https://frappehr.com/files/advance-returned-amount.png)

> Note: (On Ledger Behaviour in v16 only):

* Creating an **Employee Advance** does **not** create any GL (General Ledger) entry. The advance voucher is only a request/reservation.
* The GL entry is created only when the **Payment Entry** (or Journal Entry) is submitted against the advance.
* When an **Expense Claim** is made against the advance, the claim fetches the linked Payment Entry(s) along with the advance and uses those to adjust claim amounts, clear the advance, and record any exchange gain/loss (in case of multicurrency transaction).
* In case of multiple payments against the same advance or partial claims/returns, each Payment Entry is separately referenced, ensuring full traceability and correct accounting.

## **4. Related Topics**

1. [Expense Claim](https://docs.frappe.io/hr/expense-claim)
