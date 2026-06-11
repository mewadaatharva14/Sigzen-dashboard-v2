---
title: Goal
url: https://docs.frappe.io/hr/goal
---

**Goal setting is the process of planning specific, measurable and role-oriented goals that employees work towards in your company.**

To check the goal list, go to:

> **Home > Human Resources > Performance > Goal**

## **1. Prerequisites**

Before creating a Goal, you should create the following:

* [Employee](https://docs.frappe.io/hr/employee)

If you want the goal's progress to impact your appraisals, you will also need to create:

* [Appraisal Cycle](https://docs.frappe.io/hr/appraisal-cycle)
* [Appraisal](https://docs.frappe.io/hr/appraisal)

## **2. Goal Setting**

### **2.1 From the tree view**

Since goals have a hierarchical structure, its easier to add new goals from the tree view. You can also update the progress for your child goals from the tree view. Parent goal's progress is auto-calculated based on child goals.

![goal tree](https://frappehr.com/files/goal-tree.png)

You can apply a filter for the Appraisal cycle and your Employee record. These fields will be picked up in the New Goal dialog.

![goal update](https://frappehr.com/files/goal-update.gif)

### **2.2 From the list view**

1. Go to the Goal list, and click on New.
2. Enter your goal. You can optionally add a detailed description of your goal.
3. You can break down your goals into sub-goals for better tracking. To do so, select the goal in the Parent Goal field. Ex: I have a goal called Quality Improvement aligned to the Quality KRA. I can add multiple goals under Quality Improvement like:

   * Bring down GitHub issues by 20%
   * Increase test converage by 30%
4. Mark the goal as **Is Group** if this goal is going to have sub-goals
5. Select the Employee.
6. Set the Start and End Dates for your goal.
7. If you want the goal's progress to impact your appraisal, select the Appraisal Cycle and tag the KRA for your goal. Now on updating the goal's progress the goal score linked to your KRA will be updated.
8. Save. The status of your goal is auto-updated based on the progress.

![goal](https://frappehr.com/files/goal.png)

![goal list](https://frappehr.com/files/goal-list.png)

## **3. Features**

### **3.1 Goal Progress Update**

Whenever a child goal is updated, the parent's goal progress is also updated.

How does a goal's progress affect its parent?

Ex: progress for the goal `child2` is 25%: the average of its children (`child3` and `child4`) progress for the goal `parent` is 12.5%: the average of its children (`child1` and `child2`)

```
parent (12.5%)
|_ child1 (0%)
|_ child2 (25%)
        |_ child3 (50%)
        |_ child4 (0%)
```

Whenever a goal is updated, the average goal completion against the KRA linked to that goal is also updated. Ex: In the screenshot below, the Development KRA has 30% weightage and the employee has completed 75% of the goals. So the goal score is 22.5 out of 30, and so on.

![kra vs goals](https://frappehr.com/files/kra-vs-goals.png)

### **3.2 Archive Goal**

Sometimes you add a goal while planning but later on, you don't want to work on that goal anymore. In that case, you can archive the goal. Archived goal's progress won't contribute to the KRA/Goal score.

![archive](https://frappehr.com/files/archive.png)

### **3.2 Close Goal**

Closing goals will stop employees from making further progress updates but would still contribute to the KRA/Goal score, unlike Archived goals. You can close a goal by clicking the **Status > Goal** button on the Goal form

## **4. Related Topics**

1. [Appraisal Cycle](https://docs.frappe.io/hr/appraisal-cycle)
2. [Appraisal](https://docs.frappe.io/hr/appraisal)
