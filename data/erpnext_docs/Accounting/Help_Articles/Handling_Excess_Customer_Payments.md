---
title: Handling Excess Customer Payments
url: https://docs.frappe.io/erpnext/handling-excess-customer-payments
---

This document outlines the standard behavior for excess customer payments (Unallocated Amount) and provides the steps to configure ERPNext to automatically post these excess amounts to a separate Customer Advance (Liability) Account.

**1. Standard Behavior: Unallocated Amount**

By default, when a Payment Entry is created for a customer and the Paid Amount exceeds the total amount of the invoices it is linked to (the Allocated Amount), the excess amount is stored against the customer's Debtor (Receivable) account.

**How it Works:**

**Excess Amount is Stored:** The difference is labeled as an "Unallocated Amount" within the Payment Entry.

**Credit to Customer:** This unallocated amount acts as a credit balance on the customer's account.

**Future Allocation:** This credit can be automatically or manually allocated against future outstanding Sales Invoices for the same customer.

**No Automatic Liability Posting:** This excess amount does not automatically move to a separate liability account

**2. Configuration for Advance Payments (Liability Account)**

If your business process requires the excess amount to be immediately posted to a specific Customer Advance Liability Account (instead of remaining in the Debtor/Receivable account), you must configure the Advance in Separate Party Account feature.

**Required Configuration Steps:**

**Step 1: Create the Customer Advance Account**
You must first create a specific Account of type 'Receivable' under the Liability Account Head.

1. List itemGo to Accounting > Chart of Accounts.
2. Create a new account (e.g., Customer Advances - Liability) under a primary Liability account (e.g., Current Liabilities).
3. Set the Account Type to Receivable.
   (Note: Using the 'Receivable' type under Liability is a specific ERPNext requirement for this feature to link correctly to the customer ledger)

**Step 2: Set the Advance Account in Company Master**
Next, you must specify this newly created account in the Company settings.

1. List itemGo to Accounting > Company.
2. Select your Company.
3. Scroll to the Accounts section.
4. In the field Advance Payments, select the Customer Advances - Liability account you created in Step 1.
5. Save the Company record.

**3. Creating a Payment Entry for Advance Allocation**

Once configured, the system needs to be instructed to treat the payment as an advance rather than linking it to an invoice that results in an excess.

**Recommended Method: Separate Advance Payment Entry**
The most straightforward and reliable method is to create the payment entry specifically for the advance amount.

1. List itemGo to Accounting > Payment Entry.
2. Set Payment Type to Receive.
3. Select the Customer.
4. Enter the Advance Amount (e.g., $2,500) in the Paid Amount field.
5. Crucially: Do not link any invoices in the Allocations table. Leave the table empty.

**System Behavior After Saving:**

When the Payment Entry is saved without any allocations, the full Paid Amount will be automatically directed to the Customer Advances - Liability account configured in the Company master.

**Alternative Method: Splitting the Payment**

If the customer pays a single amount covering an invoice plus an excess, you can split the payment into two entries:

1. List itemPayment Entry 1 (Invoice): Create a Payment Entry for the exact amount of the existing Sales Invoice.
2. Payment Entry 2 (Advance): Create a second Payment Entry for the excess amount (e.g., $2,500), following the Recommended Method above (no invoice allocation).

This process ensures the excess funds are cleanly moved into the dedicated Liability account for proper accounting.
