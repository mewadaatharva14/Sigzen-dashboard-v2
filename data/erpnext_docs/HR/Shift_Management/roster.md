---
title: Roster
url: https://docs.frappe.io/hr/roster
---

## **1. Prerequisites**

Before using the Roster, it is advisable you create the following:

* [Shift Type](https://docs.frappe.io/hr/shift-type)
* [Shift Assignment](https://docs.frappe.io/hr/shift-assignment)

## **2. How to Access the Roster**

To access the roster, go to:

> **Home > Human Resources > Shift & Attendance > Roster**

You can also access it directly from https:///hr/roster. For example, if your site url is https://frappeio.frappe.cloud, go to https://frappeio.frappe.cloud/hr/roster.

## **3. Features**

### **3.1 Calendar View**

The Roster features the visualization of Employee - Shift, Leave, and Holiday mapping in an Employee vs Day of the Month representation.

![355695579-9695b9dc-7b07-4541-93b0-d55521e01362](/files/355695579-9695b9dc-7b07-4541-93b0-d55521e01362.png)

### **3.2 Searching and Filtering**

You can use the search bar to search for employees. You can also filter shifts by company, department, branch, designation, and shift type.

!

### **3.3 Creating Shifts**

Click on the plus button in a cell to create a shift corresponding to that date and employee. The roster allows for two types of shifts to be created.

**Regular Shifts**

Creating a regular shift results in the creation of a single Shift Assignment. Shifts spanning a week or less are automatically created as regular. For shifts spanning over a week, the user will have to select all days from the Repeat On Days field, under Schedule Settings, to ensure that a regular shift is created.

![355756505-0ec2ecee-e311-40fc-95e4-99562a3ca2ef](/files/355756505-0ec2ecee-e311-40fc-95e4-99562a3ca2ef.png)

**Repeating/Scheduled Shifts**

The user has the option to turn shifts spanning over a week into repeating shifts. This can be done by selecting specific days from the Repeat On Days field and setting the Frequency field—which represents the frequency of repetition. Doing so will fetch a Shift Schedule with these specifications, or create a new one if it does not exist. This Shift Schedule will then be assigned to the employee with the rest of the shift details via a Shift Schedule Assignment.

![355697616-f0731f69-3897-40b2-afa2-b0b4b8e77404](/files/355697616-f0731f69-3897-40b2-afa2-b0b4b8e77404.png)

### **3.4 Viewing and Updating Shifts**

Click on a shift to view it in detail. Edit its values and click on 'Update' to update it.

!

### **3.5 Deleting Shifts**

Click on the Delete button to delete a shift. This presents the user with three options:-

**Shift for [Date]**: Delete the shift only on that date. This is done by updating the Shift Assignment and creating another one if needed.

**All Consecutive Shifts**: Delete the Shift Assignment altogether.

**Shift Schedule Assignment**: Delete the Shift Schedule Assignment and all the Shift Assignments associated with it.

!

### **3.5 Moving and Swapping Shifts**

Shifts can be dragged and dropped to move them. Dropping a shift on another will swap it with that one.

![355751174-509bb203-8e39-42aa-8cd9-aebf0e6beeb3](/files/355751174-509bb203-8e39-42aa-8cd9-aebf0e6beeb3.gif)

## **4. Related Topics**

1. [Shift Type](https://docs.frappe.io/hr/shift-type)
2. [Shift Assignment](https://docs.frappe.io/hr/shift-assignment)
3. [Shift Schedule](https://docs.frappe.io/hr/shift-schedule)
4. [Shift Schedule Assignment](https://docs.frappe.io/hr/shift-schedule-assignment)
