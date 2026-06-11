---
title: Petty Cash Entry In Erpnext
url: https://docs.frappe.io/erpnext/petty-cash-entry-in-erpnext
---

Petty Cash is a small amount of cash on hand used for paying expenses like Travel, Telephone, etc, that are too small to merit writing a cheque. You can make such entries into ERPNext via Journal Entry.

To book petty cash expenses, follow the below steps:

1. Create accounts under Chart of Accounts.

a) Cash Account

!

b) Expense Accounts (under Indirect Expenses)

!

**NOTE:** Most of these accounts will already be created. If you need to create a few more of your choice, you can do so. You can refer [this link](/erpnext/chart-of-accounts) to know how to create the same.

2. Create a [Journal Entry (JV)](/erpnext/journal-entry) of type Cash.

3) The default Cash account will be auto-populated in the row for the Credit side.You can change this account

4. Add the Expense account in the table. You can also add multiple Expense accounts (eg. Telephone Expense, Travel Expense, etc.) as separate rows. Make sure the Debit and Credit side is balanced.

!

5. Additionally, you can also add Reference number, Date, Remarks for future reference.
6. Save and Submit.

You can view the Accounting Ledger from the Journal Entry Itself via the View button.

!
