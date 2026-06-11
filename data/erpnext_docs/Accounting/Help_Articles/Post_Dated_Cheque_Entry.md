---
title: Post Dated Cheque Entry
url: https://docs.frappe.io/erpnext/post-dated-cheque-entry
---

Post Dated Cheque is a cheque dated on future date. Party generally give post dated cheque, as advance payment. This cheque would be cleared only when cheque date arrives.

In ERPNext, create Payment Entry for post dated cheque.

#### New Payment Entry

To open new journal voucher go to:

> `Accounting > Payment Entry > New`

#### Set Posting Date

Assuming your Cheque Date is 31st December, 2016 (or any future date). As a result, this posting in your bank ledger will appear on Posting Date updated.

![Screenshot 2024-07-30 at 12.33.43 PM](/files/Screenshot%202024-07-30%20at%2012.33.43%20PM.png)

Note: Payment Entry Reference Date should equal to or less than Posting Date.

#### Save and Submit

After entering required details, Save and Submit the Payment Entry.

#### Adjusting Post Dated Cheque Entry

You can adjust Post Dated Payment Entry against an invoice via [Payment Reconciliation Tool](/erpnext/payment-reconciliation).

When cheque is cleared, i.e. on actual date on the cheque, you can update its Clearance Date via [Bank Reconciliation Tool](/erpnext/bank-reconciliation).

In the Chart of Accounts, you might find value of this Payment Entry already reflecting against bank Account. You should check **Bank Reconciliation Statement**, a report in the account module to know difference of bank balance as per system, and actual balance in the bank's statement.
