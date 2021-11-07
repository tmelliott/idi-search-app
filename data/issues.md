## Files with issues

### Census 2013

Dataset Summary

- rows 516--521, IDI Table Name: [cen_clean].[census_unocc_dwelling] -> [cen_clean].[census_unocc_dwelling_2013]

### HLFS Supplesments

Dataset Summary

- all rows missing "hlfs" prefix in table name

### HNZ

Dataset Summary

- rows 132--148, IDI Table Name: [hnz_clean].[register_status_change_househld] -> register_status_changes_househld

### IR EI-E

Dataset Summary (called "Variables_info" instead)

- all rows missing database/collection name, [clean_read_IR_MONTHLY].

### Iwi affiliation

Index - wrong name (already mentioned)

Dataset Summary

- all rows, table name [clean_read_CEN]. -> [clean_read_IWI].

### MOH New Zealand Health Survey

Dataset Summary

- duplicated/incorrect rows 184--185 (same variable name, same description)
- duplicated/incorrectly rows 1039--1040 (same variable name, different descriptions)

### MSD Fixed Forecasting Costing

Dataset Summary (called "Variable Information" instead)

- some of rows 236--260, typo in IDI Table Name: [clean_read_MSD].[prntspo_202107] -> [clean_read_MSD].[prntsupo_202107]

### YST

Dataset Summary

- rows 18--26, typo in IDI Table Name: [yes.clean]. -> [yst.clean].

## Pedantic things (e.g., inconsistent naming, typos in column/label names)

These aren't much of a problem for someone looking at the dictionaries, but I ran into issues when trying to write a script to read all of them.

Index of many (almost all?):

- typo in "Datasets Avaiable" typo (should be "Available")

Dataset_Summary

- some tables it's "Variable Information", or "Variable Info"; some use underscore while others don't ("Dataset_Summary" vs "Dataset Summary")
- some tables have brackets around variable_name, while some don't ("variable_name" vs "[variable_name]")
- Second column is usually "Field name", but in some tables it's "Variable name"
- some tables use "Description", others use "Variable Description", same with "Type", "Size" columns (some tables include "Variable" prefix)
- "Is Nullable ?" vs "Is Nullable?" (inconsistent space); some "Is NULL?"
- "Additional Information" vs "Additional Variable Information"
- typo ACC Claims, "Variable desciption"
