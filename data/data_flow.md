---
title: IDI Search App - Data loading process
author: Tom Elliott
---

```mermaid
flowchart TD
    dict[Data Dictionary]
    rawvars[IDI Variable List]
    new[New Data folder]
    live[("IDI Search App Database\n(PlanetScale)")]

    dict --> new
    rawvars --> new
    subgraph gdrive[Google Drive]
    new --> R1[["Process & clean\n(R script)"]]
    R1 --> collection & dataset & variables & vars
    subgraph meta[DD Metadata]
        collection[Collection]
        dataset[Dataset]
        variables[Variables]
    end
    vars[Variable Lists]
    collection & dataset & variables & vars & extra --> R2
    extra[Manual metadata]
    end gdrive[Google Drive]
    R2[["Combine\n(R script)"]]
    subgraph final[Final CSV files]
      direction TB
      Agency
      Collection
      Dataset
      Variable
      Other
    end
    R2-->final
    final -->live
```
