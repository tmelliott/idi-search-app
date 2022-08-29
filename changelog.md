# version 0.x

**TBA**

- Added database filtering (to only show variables in a selected database)
- Added 'Quick Stats' page

# version 0.1.5

**Updated 5 August 2022**

- Added several additional data dictinoaries
- Added two most recent refreshes
- Refresh now shows month-year (instead of day/month/year)

# version 0.1.4

**Updated 18 July 2022**

- Fixes a small bug preventing variables matching search term but missing data dictionary information from displaying in search results

# version 0.1.3

**Updated 4 March 2022**

- Display tables identified (manually) as potentially being the same (across refreshes), for example historic tables or those that have been renamed

# version 0.1.2

**Updated 22 February 2022**

- Improves display of variables (using pagination)
- Sorts all lists alphabetically
- Adds all variables in the IDI (including many that are missing from available data dictionaries)

# version 0.1.1

**Updated 25 January 2022**

Minor patch to fix handling of variables and datasets without collections, in preparation for including all variables in the IDI, and not just those we have extracted from data dictionaries. These variables are missing descriptions and collection information, so are of limited use at this stage but will be updated as we can add more dictionaries.

# version 0.1.0 (beta release)

**Released 7 December 2021**

Initial release of IDI Search - beta developmental build.

Highlighted features for this release are:

- information about a subset of agencies, collections, datasets, and variables where we have received the necessary data dictionaries
- listing of collections belonging to an agency; datasets in a collection; variables in a dataset
- for datasets, a list of ‘Linking’ variables is also displayed (either agency or IDI linking variables)
- search bar to search all fields to filter the master list of agencies/collections/datasets/variables, with the search term highlighted in descriptions
- display of refresh availability to see which IDI refreshes a variable is available in (this does not apply to Adhoc tables)
