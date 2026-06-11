---
title: Process Payment Reconciliation Tool
url: https://docs.frappe.io/erpnext/process-payment-reconciliation-tool
---

[Open in ChatGPT

[Open in Claude

# Process Payment Reconciliation Tool

[Open in ChatGPT

[Open in Claude

The **Process Payment Reconciliation** tool in ERPNext is a dedicated utility under the Accounts module that automates the matching and linking of outstanding payments against their corresponding invoices. Rather than manually reconciling each payment entry or journal entry one by one against invoices, this tool lets you run reconciliation in bulk, either on-demand or through a background scheduler.

It works by identifying unallocated payment entries, advance journal entries, or credit notes and automatically allocating them against open invoices for a given party (Customer or Supplier), filtered by the relevant accounts.

> **Accounts > Process Payment Reconciliation**

---

## Use Cases

**When should you use this tool?**

* You have received payments from customers (or made payments to suppliers) that are not yet linked to specific invoices.
* You have advance payments recorded as Journal Entries and want to reconcile them against newly raised invoices.
* You need to run bulk reconciliation across multiple parties at the end of a financial period without doing it manually from each invoice.
* You want to schedule automatic reconciliation to run overnight or at regular intervals via the ERPNext Scheduler, so your books are always up to date without manual intervention.
* You are dealing with a high volume of transactions and the standard **Payment Reconciliation** tool (which is party-specific and one-at-a-time) is not efficient enough for your scale.

---

## Using Process Payment Reconciliation

### Step 1: Navigate to the Tool

Go to: **ERPNext → Accounts → Process Payment Reconciliation**

You can also search for "Process Payment Reconciliation" using the Global Search bar (press `Ctrl + /` or the search icon at the top).

> 📸 **[Screenshot: ERPNext home screen with Accounts module open and "Process Payment Reconciliation" highlighted in the left sidebar or module card]**

---

### Step 2: Create a New Process Payment Reconciliation Document

Click **New** to create a new record.

> 📸 **[Screenshot: The blank "New Process Payment Reconciliation" form showing all the key fields before filling]**

---

### Step 3: Fill in the Required Fields

You will need to fill in the following fields:

**Company**: Select the company for which you want to run the reconciliation.

**Party Type**: Select either `Customer` or `Supplier` depending on the party whose payments you want to reconcile.

**Party**: Select the specific party (customer or supplier). You can leave this blank if you want to reconcile across all parties of the selected type (depending on your ERPNext version).

**Receivable / Payable Account**: Select the main receivable or payable account (e.g., `Debtors` or `Creditors`). This is the ledger account that holds the outstanding invoices.

**Advance Account** *(Mandatory)*: This field is required because the tool needs to know which account holds advance payments or unapplied credits to match against. This is typically a dedicated advance account (e.g., `Advance from Customers` or `Advance to Suppliers`). **Do not remove the mandatory constraint from this field** — without it, the tool cannot identify which payment entries to pull in for reconciliation, which will cause the scheduler job to fail.

> 📸 **[Screenshot: Filled-in form showing Company, Party Type = "Customer", Party, Receivable Account, and Advance Account fields with example values]**

---

### Step 4: Set Filters (Optional but Recommended)

You can optionally apply filters to narrow down the reconciliation scope:

* **From Date / To Date**: Restrict reconciliation to invoices and payments within a date range.
* **Cost Center**: Filter by a specific cost center if applicable.

> 📸 **[Screenshot: The optional filter section of the form with date fields filled in]**

---

### Step 5: Save and Run

Click **Save** to save the document. Then click the **Reconcile** button (or **Start** depending on your version) to trigger the reconciliation immediately.

The tool will:

1. Fetch all outstanding invoices for the selected party and account.
2. Fetch all unallocated payments or advance entries against the selected Advance Account.
3. Match and allocate payments against invoices on a FIFO (oldest first) basis.
4. Create the necessary allocation entries in the background.

> 📸 **[Screenshot: The saved form with the "Reconcile" / "Start" button highlighted, and a progress indicator or success message after running]**

---

### Step 6: Run via Scheduler (Automated Reconciliation)

If you want this reconciliation to run automatically on a schedule:

1. Save the Process Payment Reconciliation document.
2. Enable the **Is Enabled** toggle (if present) on the document, or confirm the document is in a **Queued** status.
3. The ERPNext Scheduler will pick up the job and run it automatically at the configured interval.

To verify the scheduler is running correctly, navigate to: **Settings → Scheduled Job Type →** `process_payment_reconciliation.trigger_reconciliation_for_queued_docs`

Check that the job status is **Active** and the **Last Execution** timestamp is updating.

> 📸 **[Screenshot: Scheduled Job Type list view showing the process\_payment\_reconciliation job with "Active" status and last execution time]**

> 📸 **[Screenshot: The Scheduled Job Type detail record showing the method name and frequency settings]**

---

### Step 7 — Monitor Logs and Troubleshoot

If the scheduled job fails, check the error logs:

1. Go to **Settings → Scheduled Job Log** (or **Error Log**).
2. Filter by `process_payment_reconciliation`.
3. Review the traceback to identify the root cause — common issues include a missing or misconfigured **Advance Account**, or the mandatory field having been removed by a customization.

> 📸 **[Screenshot: Error Log or Scheduled Job Log showing a failed job entry with the traceback expanded]**

---

## 4. Important Notes

**Do not make the Advance Account field non-mandatory.** This field is mandatory by design. If you have previously customized the form to make it optional, the scheduler job will fail because it cannot process documents that do not have an Advance Account specified. Revert the field back to mandatory in **Customize Form** if this change was made.

**Idempotency:** The tool is safe to run multiple times. If payments have already been allocated, they will not be duplicated.

**Permissions:** Ensure the user running the tool (or the system user running the scheduler) has the appropriate permissions on the Payment Reconciliation, Payment Entry, and Journal Entry doctypes.

[Previous Page
Process Statement Of Accounts](/erpnext/process-statement-of-accounts)
[Next Page
Accounts Settings](/erpnext/accounts-settings)

Last updated 1 day ago

Submit

Thanks!
