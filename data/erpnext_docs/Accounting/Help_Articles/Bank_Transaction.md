---
title: Bank Transaction
url: https://docs.frappe.io/erpnext/bank-transaction
---

[Open in ChatGPT

[Open in Claude

# Bank Transaction

[Open in ChatGPT

[Open in Claude

The **Bank Transaction** form shows bank transactions imported into ERPNext, typically from bank statements or integrations.

## 1. Prerequisites

Before using **Bank Transaction**, it is advised that you create the following first:

1. **[Bank](/erpnext/user/manual/en/bank)**
2. **[Bank Account](/erpnext/user/manual/en/bank-account)**

## 2. How to use Bank Transaction

A **Bank Transaction** is typically not created manually. It can be imported or created using:

1. **[Bank Statement Import](/erpnext/user/manual/en/bank-reconciliation#321-bank-statement-import)** — import from CSV or XLSX files
2. **[Data Import](/erpnext/user/manual/en/data-import)** — standard data import tool
3. Bank integration apps (e.g., Plaid or other third-party integrations)

Once imported, **Bank Transactions** can be reconciled with vouchers using the **[Bank Reconciliation Tool](/erpnext/user/manual/en/bank-reconciliation)**.

## 3. Fields

### 3.1 Basic Information

* *Date*: The date of the bank transaction.
* *Status*: The current status of the transaction:
  + Pending
  + Settled
  + Unreconciled
  + Reconciled
  + Cancelled
* *Bank Account*: The **Bank Account** from which the transaction was made.
* *Company*: The **Company** associated with the bank account (auto-fetched from *Bank Account*).

### 3.2 Transaction Amount

* *Deposit*: The amount deposited (credited to your account).
* *Withdrawal*: The amount withdrawn (debited from your account).
* *Currency*: The currency in which the transaction was made.

### 3.3 Description and Reference

* *Description*: A description from the bank statement.
* *Reference Number*: A cheque number or other reference.
* *Transaction ID*: A unique identifier from the bank (read-only).
* *Transaction Type*: The type of transaction as reported by the bank.

### 3.4 Payment Entries

The *Payment Entries* table links the bank transaction to vouchers in ERPNext for reconciliation:

* *Payment Document*: The document type against which the transaction was reconciled, such as **Sales Invoice**, **Purchase Invoice**, **Payment Entry**, **Journal Entry**, or **Expense Claim**.
* *Payment Entry*: The specific document linked to this transaction.
* *Allocated Amount*: The amount allocated from this bank transaction to the payment entry.
* *Clearance Date*: The date when the payment was cleared (shown after submission).

### 3.5 Allocation Summary

* *Allocated Amount*: The total amount that has been allocated to payment entries (read-only).
* *Unallocated Amount*: The remaining amount that has not been allocated (read-only).

### 3.6 Payment From / To (Party Information)

* *Party Type*: The type of party (e.g., Customer, Supplier, Employee).
* *Party*: The specific party linked to this transaction.

The following fields contain party information as provided by the bank statement:

* *Party Name/Account Holder (Bank Statement)*: The party name from the bank statement.
* *Party Account No. (Bank Statement)*: The party's account number from the bank statement.
* *Party IBAN (Bank Statement)*: The party's IBAN from the bank statement.

> Party information from the bank statement can be used for automatic party matching when enabled in **Accounts Settings**.

### 3.7 Extended Bank Statement (Fee Handling)

These fields handle bank fees that may be included in or excluded from the transaction amount:

* *Included Fee*: A fee that is already included within the *Withdrawal* amount. For example, if a withdrawal of 100 includes a 5 fee, the net payment is 95.
* *Excluded Fee*: A fee that was charged separately from the transaction. On save, this is automatically converted to an *Included Fee* by adjusting the transaction amount.

> **Note:** Excluded fees adjust the transaction amount: they reduce *Deposit* or increase *Withdrawal*.

[Previous Page
UnReconcile](/erpnext/unreconciliation)
[Next Page
Include Tax or Charge in Valuation or Total?](/erpnext/difference-in-total-and-valuation-in-tax-and-charges)

Last updated 3 months ago

Submit

Thanks!
