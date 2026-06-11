---
title: Budget
url: https://docs.frappe.io/erpnext/budget
---

[Open in ChatGPT

[Open in Claude

# Budget

[Open in ChatGPT

[Open in Claude

**Budgeting is a financial plan that helps controlling company expenses.**

Budgeting helps control company expenses by defining how much can be spent, where it can be spent, and within which fiscal years.

In ERPNext, budgets are created against a single dimension (Cost Center, Project, or Accounting Dimension) and are used to plan expenses and prevent overspending.

To access the Budget list, go to:

> Home > Accounting > Cost Center and Budgeting > Budget

## 1. Prerequisites

Before creating and using Budgets, ensure the following are set up:

* Cost Center
* Project
* Fiscal Year

## 2. How to Create a new Budget

---

1. Go to the Budget list and click Add Budget.
2. Select the Company.
3. Select Budget Against (Cost Center, Project, or an Accounting Dimension).
4. Select the From Fiscal Year and To Fiscal Year.
5. Select the Account for which the budget is being created.
6. Enter the Budget Amount for the selected account.
7. Configure the Distribution Frequency (Monthly, Quarterly, Half Yearly or Yearly).
8. Enable Distribute Equally to automatically split the budget across periods, or manually define Budget Distribution rows with amounts, or percentages.
9. Save and Submit the Budget.

> A single Budget applies to one account and one dimension, and can span multiple fiscal years.

![](/files/Screenshot%202026-01-08%20at%202.28.50%E2%80%AFPM.png)

---

## 3. Budget Distribution

Budget Distribution controls how the total budget amount is allocated across time within the selected fiscal years. Each row of budget distribution child table contains - Start Date, End Date, Amount, Percentage.

#### Distribution Frequency

Distribution Frequency defines the time interval used for budget allocation:

* Monthly – Budget is distributed across months
* Quarterly – Budget is distributed across fiscal quarters
* Half-Yearly – Budget is distributed across half-year periods
* Yearly – Budget is applied at the fiscal year level

#### Distribute Equally

On budget there is a checkbox `Distribute Equally`, when this checkbox is enabled, the total budget amount is split evenly across all periods. Budget Distribution rows are generated automatically.

When Distribute Equally is disabled, budget distribution rows are still generated automatically based on the selected distribution frequency but Start Date and End Date are not editable and you can manually adjust: Amount or Percentage.

![](/files/Screenshot%202026-01-08%20at%203.11.14%E2%80%AFPM.png)

---

## 4. Control Actions (Alerts)

Control actions can be triggered when:

* A Material Request is being submitted
* A Purchase Order is being submitted
* When an actual expense is being posted (through a journal entry or a purchase invoice).

You can set a control action in the Budget based on Material Requests, Purchase Orders, or on actual expenses. Further, you can set a control action for annual or monthly budgets.

![](/files/Screenshot%202026-01-08%20at%203.28.27%E2%80%AFPM.png)

There are three types of control actions.

* **Stop**: This will not allow users to submit the transaction.
* **Warn**: This will show a warning message but lets the user submit the transaction.
* **Ignore**: This will neither prevent the user from submitting transactions nor show an error message.

You can set separate actions for monthly and annual budgets. If you exceed the budget, a warning will be shown:

Note that a similar warning will be triggered for any type of transactions set in the budget for the particular Account heads.

![](/files/Screenshot%202026-01-08%20at%203.33.37%E2%80%AFPM.png)

---

## 5. Exception Budget Approver Role

This setting allows selected users to bypass budget restrictions even when the budget is exceeded.

* Configure this role in Company settings

![](/files/Screenshot%202026-01-08%20at%205.19.51%E2%80%AFPM.png)

---

1. Video

---

Here is a video demonstration:

Related Topics

1. Budget Revision
2. Cost Center

[Previous Page
Share Reports](/erpnext/share-reports)
[Next Page
Budget Revision](/erpnext/budget-revision)

Last updated 3 months ago

Submit

Thanks!
