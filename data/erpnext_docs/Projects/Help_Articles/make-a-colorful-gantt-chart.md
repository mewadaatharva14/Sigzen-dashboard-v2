---
title: Make A Colorful Gantt Chart
url: https://docs.frappe.io/erpnext/make-a-colorful-gantt-chart
---

ERPNext allows users to add colours to certain documents for better visual cues and representation. A good example of this would be the [Event Calendar](/erpnext/how-to-sync-doc-types-with-calendar), where, for each event you can add a colour.

We will be doing so by customizing [Tasks](/erpnext/tasks) under Projects module.

## Steps To Add Colours To The Gantt Chart

1. Go to [Customize Form](/erpnext/customize-form) in the system and select *Task* in *Enter Form Type* option. Alternatively, you can reach this screen by going to **Menu > Customize** from the Task list or form.

![customize-form](/files/project-gantt-customize-form-1.gif)

1. Add a new field in the doctype of fieldtype color.
2. Check *In List View* option.

![customize-form](/files/project-gantt-in-list.png)

1. Save the form, go back to the Task list, and reload.
2. When opening an existing or new Task, you should see a color field. Pick a color for the Task.

![customize-form](/files/project-gantt-pick-color.png)

1. Go back to the Task list and switch to Gantt view.

![customize-form](/files/project-gantt-colors.png)
