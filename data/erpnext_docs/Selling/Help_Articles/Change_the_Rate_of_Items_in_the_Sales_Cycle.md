---
title: Need To Change Rate Of Items During Sales Cycle
url: https://docs.frappe.io/erpnext/need-to-change-rate-of-items-during-sales-cycle
---

Sometimes, the rate of items in the Sales Invoice might differ from the one declared in the Sales Order. You may follow these steps to allow this configuration within ERPNext:

1. Go to Selling Settings and make sure the "Maintain Same Rate Throughout Sales Cycle" checkbox is unchecked. This setting will allow you to have different rates for the same items in different Sales transactions (Sales Order, Delivery Note, Sales Invoice, etc.).  
   !
2. Go to Accounts Settings and set the Over Billing Allowance (%).  
   !

With the above two settings, you can change the rates of an item in a Sales Transaction.
