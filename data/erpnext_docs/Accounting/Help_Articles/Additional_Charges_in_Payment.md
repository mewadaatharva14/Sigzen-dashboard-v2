---
title: Use-case for deducting bank charges in Payment Entry
url: https://docs.frappe.io/erpnext/handing-deductions-in-payment-entry
---

When a customer wires a payment amount through a bank or payment gateway, a transfer fee is applied to the transaction. This results in a difference between the amount paid by the Customer (equal to the invoice amount) and the amount credited to our bank account. In ERPNext, you can allocate this difference amount under the Payment Deductions or Loss section.

### Use-case for deducting bank charges in Payment Entry

* Invoice amount / Customer paid = $4810
* Bank actually received = $4800
* Bank deducted charges = $10

In the following steps. We will learn how to create a Payment Entry in which the invoice is marked as Paid, while the bank charges are booked as a deduction.

### Allocate Paid Amount

In this field, enter the actual amount realised in the bank account. As per our use case, it will be $48,800, even though the invoice amount is $ 4,810.

!

### Allocate Invoice Amount against Sales Invoice

When the Paid Amount is updated to be less than the Invoice, the allocated amount against the Sales Invoice is automatically updated. In this case, it will be reduced. To ensure the Sales Invoice is fully paid after this payment entry, ensure the Allocated Amount is the same as the Invoice value.

In the Payment Reference table, ensure $4,810 is updated to Allocated Amount so the invoice is marked as paid.

!

### Allocating the Difference Amount in Deductions

Because the Paid Amount ($4800) differs from the Allocated Amount ($4810), a $10 Difference Amount remains unallocated to any accounting ledger. To ensure the debit and credit postings in this entry match, an account will need to be allocated to account for the $10 difference. Since this difference arises from bank charges, the amount will be allocated to the relevant account selected in the Deductions table.

!

Tip

If your debtor & bank currency is different than base currency of a company, then ensure that value in the deduction table is entered in the base currency of a Company.

### Final Posting

As per this allocation:

* The invoice will be marked as completely paid
* Bank account will only reflect the actual amount received in the bank, hence easing reconciliation
* Accurate booking of bank charges or currency exchange gain/loss through Payment Deductions and Loss posting
