---
title: Introduction
url: https://docs.frappe.io/hr/india-payroll/introduction
---

# Introduction

India Payroll is an open-source Frappe HR extension app that automates statutory payroll deductions and compliance reporting for Indian businesses.

## Why India Payroll?

Running payroll in India means complying with multiple overlapping statutory obligations. Doing this manually inside salary structure formulas is fragile and hard to maintain.

India Payroll takes a different approach:

* **Zero formula changes** - All deductions are injected via `before_save` hooks on the Salary Slip. Your salary structures stay clean.
* **Single toggle to activate** - Enable each deduction type from **Payroll Settings → India Payroll** tab.
* **State-aware** - Rules are driven by the `employment_state` field on Salary Structure Assignment, not hard-coded in structures.
* **Auditable** - Each deduction appears as a named salary component on the slip, visible to HR and employees alike.
