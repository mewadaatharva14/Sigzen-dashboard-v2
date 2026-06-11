---
title: Calculate Incentive For Sales Team
url: https://docs.frappe.io/erpnext/calculate-incentive-for-sales-team
---

You can Calculate Incentives for sales team using custom scripts.

Can be used in any Sales Transaction with **Sales Team** Table:

cur\_frm.cscript.custom\_validate = function(doc) {
// calculate incentives for each person on the deal
total\_incentive = 0
$.each(wn.model.get("Sales Team", {parent:doc.name}), function(i, d) {

// calculate incentive
var incentive\_percent = 2;
if(doc.grand\_total > 400) incentive\_percent = 4;

// actual incentive
d.incentives = flt(doc.grand\_total) \* incentive\_percent / 100;
total\_incentive += flt(d.incentives)
});

doc.total\_incentive = total\_incentive;
}
