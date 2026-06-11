---
title: Multicurrency Employee Advance Expense Claim
url: https://docs.frappe.io/hr/multicurrency-employee-advance-expense-claim
---

**Employees working internationally or handling expenses in foreign currencies may receive advances in currencies different from the company’s base currency. Frappe HR now supports Multi-Currency handling for both Employee Advance and Expense Claim to be recorded, paid, adjusted, and managed in any currency while maintaining accurate accounting and exchange rate impact.**

With this feature in v16, it now supports:

* Multi Currency Employee Advances
* Multi Currency Expense Claims
* Accurate exchange rate conversions
* Automatic exchange gain/loss entries
* Multiple Payment Entry against the same advance

## **1. Prerequisites**

1. Employee
2. Department
3. Chart of Accounts
4. Multi Currency Setup
5. Employee Advance
6. Expense Claim

**1.1 Create Expense Claim Type & Mode of Payment**

Before creating multicurrency records, make sure your **Expense Claim Types** and **Modes of Payment** are configured with accounts that use the correct currency.

For example, the standard **Expense Claim Type** (such as *Travel*) may be linked to an account in the company’s base currency. So such a type won’t accept a claim in a different currency. In these cases, create a separate expense type (e.g., *Travel — USD*) and link it to an account that uses the same transaction currency

!
*Expense Claim Type*

Similarly, if you are paying via Bank or Cash in a foreign currency, the Mode of Payment must link to a corresponding currency account. This ensures that expense claims and advances in currencies other than the company’s base currency are captured and processed correctly.

!
*Mode of Payment*

## **2. Multi-Currency in Employee Advance**

Before creating an Employee Advance, ensure that the **Employee Salary Currency** is correctly set in the Employee master.

A new field **Employee Advance Account** is added in the Employee master. This account should match the employee’s salary currency.

> **Note:** If these fields are not set, Employee Advance allows manual selection. Make sure the advance account exists with the correct currency before creating an advance.

**2.1 How to Create a Multi-Currency Employee Advance**

1. Go to: **Employee Advance > New**
2. Select the **Employee**
3. Choose the **Currency** if not fetched automatically and enter the **Advance Amount**
4. Under the Accounting section:

* **Advance Account** is fetched from **Employee Advance Account** in the Employee master; if not fetched, select manually
* Select **Mode of Payment** if applicable

5. Save the document

![emp-advance](/files/MultiCurrencyEmployeeAdvance.png)

## **3. Payment of Multi-Currency Advances**

Payment for a submitted Employee Advance can be made via **Payment Entry**.

> **Note**

* At the time of payment, the current exchange rate will be fetched. This rate is used to calculate the base currency amounts and determine exchange gain/loss during Expense Claim.
* The original exchange rate on the Employee Advance is no longer used; the payment exchange rate is used for all further calculations.

**3.1 Multiple Payment Entries**

If the same advance has multiple payments:

* Each payment is tracked separately
* Multi-currency payments with different exchange rates are supported
* Correct amounts are reflected in Expense Claim

## **4.Multi Currency Expense Claim**

1. From **Employee Advance → Make Expense Claim**

* The advance currency will be fetched in the Expense Claim.
* All linked advances will appear in the **Advances Table**.
* Exchange rate at the time of payment will also be fetched in Advances Table.
* Base currency values are auto-calculated based on the exchange rate at the time of claim.
* If the same advance has multiple payments, each payment will appear as a separate row in Advances Table with the corresponding **Payment Entry** reference. This helps in reconciling partially claimed advances.

![multi-payments](/files/multi-payments.jpeg)

Once the Expense Claim is Submitted, the claim amount is allocated from the Advance table

![advance-claimed](/files/advance-claimed.jpeg)

## **5. Exchange Gain/Loss Handling**

* If the exchange rate at the time of Expense Claim differs from the exchange rate at the time of advance payment:
  + Exchange gain/loss is calculated for each advance row
  + Total gain/loss is posted via **Journal Entry**, ensuring accurate accounting

![gain_loss](/files/gain_loss.jpeg)

![gain_loss-booked](/files/gain_loss-booked.jpeg)

**References:**

* Employee Advance
* Expense Claim
