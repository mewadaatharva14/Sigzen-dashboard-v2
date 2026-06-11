---
title: Customer Defaults
url: https://docs.frappe.io/erpnext/selling-settings
---

Selling Settings is where you can define properties and validations which will be applied to the masters and transactions involved in the sales cycle.

To access Selling Settings, go to:

> Home > Selling > Settings > Selling Settings

## Customer Defaults

![Screenshot 2024-08-29 at 12.29.37 PM](/files/Screenshot%202024-08-29%20at%2012.29.37%20PM.png)

### 1. Customer Naming By

When a customer is saved, a unique ID is generated for that Customer.

By default, Customer ID is generated based on Customer Name.

If you wish to save Customer using a naming series, in the field Customer Naming Series, set value as "Naming Series". Example of Customer ID's saved in Naming Series - "CUST00001, CUST00002, CUST00003..." and so on.

### 2. Default Customer Group

Select a default Customer Group which will be auto-updated when creating a new Customer.

Quotations can be created for the Customers as well as for the Leads. When converting a Quotation into a Sales Order, which is created for a Lead, the system attempts to convert that Lead into a Customer. While creating Customer in the backend, the value for Customer Group is picked from Selling Settings. If no default values are found for Customer Group, then you will receive a validation message asking for the Customer Group. You can also manually convert a Lead into a Customer.

### 3. Default Territory

Select a default Territory which will be auto-updated when creating a new Customer.

Quotations can be created for the Customers as well as for the Leads. When converting a Quotation into a Sales Order, which is created for a Lead, the system attempts to convert that Lead into a Customer. While creating Customer in the backend, the value for Territory is picked from Selling Settings. If no default values are found for Territory, then you will receive a validation message asking for the Territory. You can also manually convert a Lead into a Customer.

## Item Price Settings

![Item Price Settings as of 2025-09-23 in v16](/files/Bildschirmfoto%202025-09-23%20um%2012.27.59.png)

### 1. Default Price List

Price List set in this field will be auto-updated in the Price List field of sales transactions like Quotation, Sales Order, Delivery Note, and Sales Invoice.

### 2. Maintain Same Rate Throughout Sales Cycle

It ensures that the same rate is maintained throughout the sales process. Once enabled, ERPNext will validate whether an Item's price is changing in a Delivery Note or Sales Invoice created from a Sales Order.

### 3. Use prices from Default Price List as Fallback

If no **Item Price** is found for an item in the **Price List** set in the Transaction, prices from the *Default Price List* will be fetched. Don't use this together with *Auto Insert Item Price If Missing* from **Stock Settings**, since prices from the *Default Price List* can end up in other price lists.

### 3. Action if Same Rate is Not Maintained Throughout Sales Cycle

You can configure the action that system should take if the same rate is not maintained in the "Action If Same Rate is Not Maintained Throughout Sales Cycle" field:

* **Stop**: ERPNext will stop you from changing the price by throwing a validation error.
* **Warn**: The system will let you save the transaction but warn you with a message if the rate is changed.

**Note:** This field will only be visible if [Maintain Same Rate Throughout Sales Cycle](/erpnext/selling-settings#2-maintain-same-rate-throughout-sales-cycle) is enabled.

### 4. Role Allowed to Override Stop Action

Allow users to add role to override "Stop" action for [Maintain Same Rate Throughout Sales Cycle](/erpnext/selling-settings#2-maintain-same-rate-throughout-sales-cycle), if [Action if Same Rate is Not Maintained](/erpnext/selling-settings#3-action-if-same-rate-is-not-maintained-throughout-sales-cycle) was set to Stop.

**Note:** This field will only be visible if 'Maintain Same Rate Throughout Sales Cycle' is enabled and 'Action if Same Rate is Not Maintained' is set to Stop.

### 5. Allow User to Edit Price List Rate in Transactions

The item table in sale transactions has a field called Price List Rate. This field is non-editable by default in all the sales transactions. This is to ensure that the price of an item is fetched from Item Price record and the user is not able to edit it.

If you need the Item Price fetched from Price List of an item to be editable, you should uncheck this field.

### 6. Validate Selling Price for Item Against Purchase Rate or Valuation Rate

When making sales, it's important to know that you're not making losses. Enabling this validation will validate the item's Selling Price with its valuation/buying price. If an item's selling price is found to be less than it's buying price, then you will get a prompt when this checkbox is ticked.

### 7. Calculate Product Bundle Price based on Child Items' Rates

Enabling this will do the following:

* Make the Rate column of all Packed/Bundle Items tables editable.
* Calculate the prices of all [Product Bundles](/erpnext/product-bundle) in the Items table, based on the prices of its Child Items, specified in the Packed/Bundle Items table.

**Note:** If this is enabled, updating the rate of the Product Bundle in the Items table will not change its price. It will get reset to the price based on its Child Items on saving the doc.

### 8. Allow Negative Rate for Items

Enable this option to permit the use of negative rates for items in sales transactions. This setting is useful for applying substantial discounts, processing refunds or returns, and handling special promotional pricing.

## Transaction Settings

![Screenshot 2024-08-29 at 12.41.21 PM](/files/Screenshot%202024-08-29%20at%2012.41.21%20PM.png)

### 1. Is Sales Order Required for Sales Invoice & Delivery Note Creation?

If you wish to make Sales Order creation mandatory before the creation of a Sales Invoice or a Delivery Note, then you should set the 'Sales Order Required' field as 'Yes'. By default, this will be 'No'.

This configuration can be overridden for a particular customer by enabling the "Allow Sales Invoice Creation Without Sales Order" checkbox in customer master.

### 2. Is Delivery Note Required for Sales Invoice Creation?

To make Delivery Note creation as mandatory before Sales Invoice creation, you should set this field as 'Yes'. By default, this will be 'No'.

This configuration can be overridden for a particular customer by enabling the "Allow Sales Invoice Creation Without Delivery Note" checkbox in customer master

### 3. Sales Update Frequency

The frequency at which project progress and company transaction details will be updated. By default it is for Each Transaction, you can also set it to Daily or Monthly if you have a lot of transactions every day.

### 4. Blanket Order Allowance (%)

It indicates the percentage one is allowed to sell beyond the Blanket Order quantity

### 5. Allow Item to be Added Multiple Times in a Transaction

This is a validation check which prevents an item from being added multiple times in the same transaction when unchecked. In some cases, this might be an explicit need if so check this box.

### 6. Allow Multiple Sales Orders Against a Customer's Purchase Order

When creating a Sales Order, you can update the Purchase Order ID and Date received from the Customer. You can create only one Sales Order against the Customer's PO No. and Date. However, if you wish to allow the creation of multiple Sales Orders against the same PO No. of the Customer, tick the checkbox "Allow multiple Sales Orders against a Customer's Purchase Order".

### 7. Allow Sales Order Creation For Expired Quotation

This allows creation of sales orders from quotations that have passed their expiration date, providing flexibility in processing orders despite outdated quotes.

### 8. Don't Reserve Sales Order Qty on Sales Return

It prevents the automatic reservation of stock quantities from sales orders when processing sales returns.

### 9. Hide Customer's Tax ID from Sales Transactions

As per the statutory requirement, most of the Customers have unique Tax ID assigned to them. They also need to have this tax ID fetched in the selling transactions. However, if you don't wish to use this functionality, you can disable by checking this property.

### 10. Enable Discount Accounting for Selling

Once enabled, additional ledger entries will be made for discounts in a separate Discount Account

### 11. Enable Cut-Off Date on Bulk Delivery Note Creation

When enabled, it adds a cutoff date filter to Delivery Notes created in bulk from Sales Orders. This allows you to process orders only with a transaction date up to the specified cutoff date, which is useful for period-end processing and batch fulfillment.

### 12. Allow Quotation with Zero Quantity

The Allow Quotation with Zero Quantity feature enables users to create and submit Sales Quotations even when one or more items have a quantity of zero. Eg. Rate Contracts.

By default, ERPNext requires all items in a quotation to have a valid quantity. When this option is enabled, the system removes this restriction and allows quotations to be generated for items without specifying the quantity.

### 13. Allow Sales Order with Zero Quantity

The Allow Sales Order with Zero Quantity feature enables users to create and submit Sales Orders even when one or more items have a quantity of zero. Eg. Rate Contracts.

By default, ERPNext requires a valid quantity for each item in a Sales Order. When this option is enabled, the system bypasses this validation and allows Sales Orders to be created with zero-quantity items.
