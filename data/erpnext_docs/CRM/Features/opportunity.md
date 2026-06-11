---
title: Opportunity
url: https://docs.frappe.io/erpnext/opportunity
---

**Opportunity is a qualified lead.**

When you get a hint that lead is looking for a product/service that you offer, you can convert that lead into an opportunity. You can also create an opportunity against an existing customer. Multiple Opportunities can be collected against a lead or a customer.

To access the Opportunity list, go to:

> Home > CRM > Sales Pipeline > Opportunity

## 1. How to Create an Opportunity

1. Go to the Opportunity list and click on 'Add Opportunity'.
2. In 'Opportunity From', select Lead if opportunity is from a lead.

![Creating New Opportunity](/files/creating-opportunity.gif)

1. You can also go to a Lead with 'Open' status and select “Opportunity” under **Create** dropdown as shown below.

![Create Opportunity From Lead](/files/lead-to-opportunity.png)

1. In 'Opportunity From', select Customer if opportunity is from a customer.
2. Select Opportunity Type. This indicates the broad category of opportunity like Sales, Support, Maintenance etc.
3. You can add more details like Opportunity Amount, Probability (of conversion), Currency in 'SALES' section.
4. You can capture the details of the products/services needed by clicking on 'With Items' checkbox and adding the item and quantity details in 'Items' section.

![Item Details in Opportunity](/files/item-details-in-opportunity.png)

1. Enter the Source of the opportunity in the SOURCE section.

## 2. Features

### 2.1 Reminders to Follow Up on Opportunities

It is important to reach out to opportunities from time to time and build the relationship. You can set the 'Next Contact Date' and 'Next Contact By' fields and a calendar event will be added for the user chosen in 'Next Contact By' field and a notification is shown on the that Date.

### 2.2 Auto-assign Opportunities to Sales Executives

> Introduced in Version 12

You can define [Assignment Rules](/erpnext/assignment-rule) to automatically assign the opportunities to sales executives.

![Opportunity Assignment](/files/opportunity-assignment-rule.png)

### 2.3 Auto-close Opportunities

If you do not receive a response from an opportunity for a certain number of days, you may want that opportunity to be closed automatically.

You can set the number of days in [Selling Settings](/erpnext/selling-settings).

![Auto Close Opportunities](/files/auto-close-opportunities.png)

### 2.4 Create a Quotation

You can create a [Quotation](/erpnext/quotation) from the **Make** dropdown. Relevant field values will be copied over.

![Create Quotation From Opportunity](/files/create-quotation-from-opportunity.png)

### 2.5 Create a Supplier Quotation

You may need to get a quotation from your supplier against the customer requirement and based on that, prepare the quotation for your customer. With ERPNext, you can make a [Supplier Quotation](/erpnext/supplier-quotation) from the opportunity itself.

> Best Practice: Leads and Opportunities are often referred as your “Sales
> Pipeline” this is what you need to track if you want to be able to predict how
> much business you are going to get in the future. Its always a good idea to be
> able to track what is coming in order to adjust your resources.

### 2.6 Capture the Reasons and Competitors for Lost Opportunities

When an opportunity is lost, you can capture the reasons, competitors and detail reason for losing. This will help you to analyse the trends over a long period of time and identify the insights needed for improvements at various areas in the organisation.

![Opportunity Lost Reason](/files/opportunity-lost-reason.png)

### 2.7 Minutes to First Response

When you send the first reply(email) to an Opportunity, it calculates Mins to First Response and is displayed in a field.

A report is generated called 'Minutes to First Response for Opportunity'. Read [CRM Reports](/erpnext/crm_reports) for more details.

### 3. Related Topics

1. [Quotation](/erpnext/quotation.html)
2. [Customer](/erpnext/customer)
3. [Lead](/erpnext/lead)
4. [Supplier Quotation](/erpnext/supplier-quotation)
5. [Difference between Lead, Contact, and Customer](/erpnext/difference_between_lead_contact_and_customer)
