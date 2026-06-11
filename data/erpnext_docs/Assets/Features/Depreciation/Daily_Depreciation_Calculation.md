---
title: 1. How it works
url: https://docs.frappe.io/erpnext/daily-depreciation
---

In the **[Accounts Settings](https://docs.erpnext.com/docs/user/manual/en/accounts-settings)** of ERPNext, there is a check box that allows users to enable "Calculate daily depreciation using total days in depreciation period" checkbox.

*This method is primarily used when the "Depreciation based on daily pro-rata" option is enabled during the asset creation process.*

!

## 1. How it works

This checkbox affects how ERPNext calculates the **daily depreciation rate** when:

* An Asset is created
* Depreciation based on daily pro-rata is enabled
* The depreciation method spans multiple years (including leap years)

Depending on whether the checkbox is enabled or disabled, the system follows one of two calculation approaches.

## 2. When checkbox is enabled:

---

This option calculates depreciation based on the exact number of days over the asset’s entire depreciation period.

**How It Works:**

1. **Calculate Total Days:** The system finds the total number of days from the depreciation start date to the end date by:
2. **Calculate Daily Rate:** Once it knows the total number of days, the function divides the total depreciation amount by this number to determine the daily depreciation rate.

### **2.1 Example**

* Asset Cost: 1,096
* Depreciation Period: 3 years (which includes 1 leap year)
* Depreciation Start Date: April 1, 2022
* Total Depreciation Amount: 1,096

Calculate Daily Rate:

* Total Days: 1,096 days (from January 1 2024, to December 31 2027, including 1 leap year)
* Daily Depreciation = Total Depreciation Amount / Total Days
* Daily Depreciation = 1,096 / 1,096 = **1.00**

The calculated daily depreciation is then multiplied by the number of days in the specified depreciation frequency to determine the depreciation amount.

!

## 3. When checkbox is disabled:

---

This option calculates depreciation on an annual basis and then divides it down to a daily rate.

**How It Works:**

* **Calculate Total Years:** The system first determines how many years the asset will be depreciated.
* **Calculate Annual Depreciation:** It divides the total depreciation amount by the number of years to find the annual depreciation amount.
* **Determine Daily Rate:** For each year, the function calculates the number of days in that year and then divides the annual depreciation by that number to get the daily rate.

### **3.1 Example**

Using the same asset details as above:

1. **Calculate Annual Depreciation:**

* Annual Depreciation = Total Depreciation Amount / Total Years
* Annual Depreciation = 1,096 / 3 ≈ **365.33**

2. **Determine Daily Rate:**

* The number of days in the years: 365 days for 2 years and 366 days for 1 leap year.
* Daily Depreciation = Annual Depreciation / Days in Year
  + For the first two years: Daily Depreciation = 365.33 / 365 ≈ **1.00092**
  + For the leap year: Daily Depreciation = 365.33 / 366 ≈ **0.9991**

The calculated daily depreciation is then multiplied by the number of days in the specified depreciation frequency (e.g., 30 for monthly, 90 for quarterly) to compute the depreciation amount.

!

## 4. Relevant Docs

---

* [Asset Depreciation](https://docs.erpnext.com/docs/user/manual/en/asset-depreciation)
* [Asset Reports](https://docs.erpnext.com/docs/user/manual/en/asset-reports)
