---
title: Rebuild Tree
url: https://docs.frappe.io/erpnext/rebuild-tree
---

The Rebuild Tree feature is a tool in ERPNext used to correct and refresh the structural integrity of hierarchical data, specifically the Chart of Accounts (CoA). It ensures that the parent-child relationships and display order of accounts are accurately reflected throughout the system.

**Issue**:

Sometime in the general Ledger report the user selects the Account but the data in the report shows for different account as shown below screenshot.
![Rebuild Issue](/files/Rebuild%20Issue.png)

In this case you can Use the **Rebuild Tree** so that the user can easily fix this issue

**Step-by-Step Guide to Rebuild the CoA Tree**

Rebuilding the tree is a quick process.

**Step 1**: Access the Chart of Accounts
Navigate to the Chart of Accounts Tree View:

Accounting > Chart of Accounts

**Step 2**: Open the Actions Menu
In the Chart of Accounts tree interface, locate and click the Menu button (usually represented by three dots or lines) in the top-right corner of the window.

**Step 3**: Select "Rebuild Tree"
From the dropdown menu that appears, select the Rebuild Tree option

![Screenshot 2025 10 16 at 1.27.11 PM](/files/Screenshot%202025-10-16%20at%201.27.11%E2%80%AFPM.png)

After Rebuild tree process is done you can check the GL report shows the correct data in the report

![Screenshot 2025 10 16 at 1.11.56 PM](/files/Screenshot%202025-10-16%20at%201.11.56%E2%80%AFPM.png)
