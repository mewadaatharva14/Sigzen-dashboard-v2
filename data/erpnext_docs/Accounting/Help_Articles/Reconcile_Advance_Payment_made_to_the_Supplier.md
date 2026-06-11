---
title: Reconcile Advance Payment Made To The Supplier
url: https://docs.frappe.io/erpnext/reconcile-advance-payment-made-to-the-supplier
---

**While migrating from *x* application to ERPNext, how to book advance Accounts Payable and reconcile with future invoices?**

**Booking Advance Accounts Payable:**

Create a **Journal Entry** with type **Opening Entry**, Debit the *Creditor Account* choosing the required *Supplier* and Credit the *Temporary Opening Account*.

Expand the Creditor's Row and select **Yes** for *Is Advance.*

*Refer to the GIF illustrating the same:*

!

Submitting the Journal Entry will reflect a negative balance in **Accounts Payable Summary**:!**Reconciling it with the Purchase Invoices:**

Refer to **Accounts Payable** report *after* creating a Purchase Invoice:

!

Currently, they are not reconciled and are reflected as **two** **separate entries**, use the **Payment Reconciliation** tool to reconcile these both entries, *refer to the GIF for the steps:*

!

Refer to Accounts Payable Report after reconciling, it *won't* reflect the **Journal Entry** anymore and will reflect the (*Invoiced Amount - Advance Amount)*:

!
