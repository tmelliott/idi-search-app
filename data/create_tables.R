# create tables to load into POSTGRES database ... limit (for now) of 10k rows
library(tidyverse)

# idi <- read_csv("data/idi.csv")

# agencies <- idi |> select(agency)

# collections <- idi |> select(collection, agency)

# variables_db <- idi |>
#     # select(c('variable_name', str_which(colnames(idi), "^IDI"))) |>
#     select(variable_name, table_name, description)

dictionaries <- list.files(file.path("data", "dictionaries"), full.names = TRUE) |>
    lapply(readxl::read_excel, sheet = "Dataset_Summary") |>
    bind_rows() |>
    rename(
        table_name = "IDI Table Name",
        field_name = "Field name",
        type = "Type",
        size = "Size",
        primary_key = "Primary Key?",
        nullable = "Is Nullable?",
        description = "Description",
        information = "Additional Information"
    ) |>
    mutate(
        primary_key = !is.na(primary_key) & primary_key == "Y",
        nullable = nullable == "Yes"
    )

adhoc <- dictionaries |>
    filter(str_detect(dictionaries$table_name, "IDI_Adhoc")) |>
    separate(table_name, c(NA_character_, "collection", "table"), "\\.")

idi <- dictionaries |>
    filter(!str_detect(dictionaries$table_name, "IDI_Adhoc")) |>
    separate(table_name, c("collection", "table"), "\\.")

## -- adhoc tables are one 'section'
adhoc_tables <- adhoc |>
    select(collection, table) |>
    distinct()

adhoc_vars <- adhoc |>
    select(table, field_name, description, information) |>
    # mend descriptions to markdown:
    mutate(
        description = gsub("\r\n", "\n", description),
        # description = gsub("\t", " ", description),
        description = gsub("\u2022", "-", description),
        description = gsub("\u2018|\u2019", "'", description),
        description = gsub("\u201C|\u201D", "\"", description)
    )

## -- idi tables are another
idi_tables <- idi |>
    select(collection, table) |>
    distinct()

idi_vars <- idi |>
    select(table, field_name, description, information) |>
    # mend descriptions to markdown:
    mutate(
        description = gsub("\r\n", "\n", description),
        # description = gsub("\t", " ", description),
        description = gsub("\u2022", "-", description),
        description = gsub("\u2018|\u2019", "'", description),
        description = gsub("\u201C|\u201D", "\"", description)
    )
