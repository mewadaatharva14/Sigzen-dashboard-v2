---
title: Moving Asset From Stock Item To Fixed Asset Item
url: https://docs.frappe.io/erpnext/moving-asset-from-stock-item-to-fixed-asset-item
---

**Question:** We have added Asset Item as a Stock / consumable Item. How to move this item to Fixed Asset register, so that Depreciation can be applied on it?

**Answer:** To move a stock or consumable item to the Fixed Asset Register in ERPNext, follow these steps:

1. **Create a Fixed Asset Item:**

   * Go to the "Item" list and create a new item, making sure to set its type as "Fixed Asset."
   * Ensure the relevant details for depreciation and asset management are filled out.
2. **Create a Fixed Asset from the Existing Item:**

   * Navigate to the "Asset" module.
   * Click on "New" to create a new Fixed Asset record.
   * Enter the details of the asset, including its asset type and the item code from the stock/consumable item.
3. **Update Asset Details:**

   * In the Fixed Asset record, update details such as purchase date, purchase amount, and other relevant information.
   * If you need to apply depreciation, set up the depreciation rules accordingly.
4. **Transfer Stock to Asset:**

   * If the item is already in stock, you’ll need to adjust the stock and record the transfer:

     + Create a Stock Reconciliation or Stock Entry to adjust the inventory.
     + Move the item from stock to a fixed asset account if needed.
5. **Set Up Depreciation:**

   * Go to the "Depreciation Schedule" in the Fixed Asset module.
   * Create a depreciation schedule for the asset based on your company's policies.

Make sure to follow your company's accounting and inventory policies when making these changes.
