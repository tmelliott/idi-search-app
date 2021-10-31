# create tables to load into POSTGRES database ... limit (for now) of 10k rows
library(tidyverse)

files <- list.files(file.path("data", "dictionaries"), full.names = TRUE)

readxl::excel_sheets(files[1])

dictionaries <- files |>
    lapply(readxl::read_excel, sheet = "Dataset_Summary") |>
    bind_rows() |>
    rename(
        table_name = "IDI Table Name",
        name = "Field name",
        type = "Type",
        size = "Size",
        primary_key = "Primary Key?",
        nullable = "Is Nullable?",
        description = "Description",
        information = "Additional Information"
    ) |>
    mutate(
        primary_key = !is.na(primary_key) & primary_key == "Y",
        nullable = nullable == "Yes",
        table_name = str_replace_all(table_name, "\\[|\\]", ""),
        name = str_replace_all(name, "\\[|\\]", "")
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
    select(table, name, description, information) |>
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
    distinct() |>
    mutate(
        schema = paste(collection, table, sep = "."),
        description = ""
    ) |>
    select(schema, collection, table, description)

idi_vars <- idi |>
    select(collection, table, name, description, information) |>
    # mend descriptions to markdown:
    mutate(
        description = gsub("\r\n", "\n", description),
        # description = gsub("\t", " ", description),
        description = gsub("\u2022", "-", description),
        description = gsub("\u8211", "-", description),
        description = gsub("\u2018|\u2019", "'", description),
        description = gsub("\u201C|\u201D", "\"", description)
    ) |>
    mutate(
        table = paste(collection, table, sep = "."),
        schema = paste(collection, table, name, sep = "."),
    ) |>
    select(schema, table, name, description, information)

# create new table..
library(RPostgreSQL)
library(dbplyr)

dotenv::load_dot_env()

con <- dbConnect(
    PostgreSQL(),
    user = Sys.getenv("PG_USER"),
    password = Sys.getenv("PG_PASSWORD"),
    host = Sys.getenv("PG_HOST"),
    port = Sys.getenv("PG_PORT"),
    dbname = Sys.getenv("PG_DATABASE")
)

dbExecute(con, "
DROP TABLE IF EXISTS idi_vars;
DROP TABLE IF EXISTS idi_tables;
")

# CREATE TABLE idi_tables (
#     schema TEXT PRIMARY KEY,
#     collection TEXT,
#     \"table\" TEXT,
#     description TEXT
# );
# CREATE TABLE idi_vars (
#     schema TEXT PRIMARY KEY,
#     \"table\" TEXT REFERENCES idi_tables (schema),
#     name TEXT,
#     description TEXT,
#     information TEXT
# );
# ")

dbWriteTable(con, "idi_vars", idi_vars, row.names = FALSE)
dbWriteTable(con, "idi_tables", idi_tables, row.names = FALSE)

dbExecute(con, "
ALTER TABLE idi_tables
    ADD CONSTRAINT idi_tables_pkey
    PRIMARY KEY (schema);
ALTER TABLE idi_vars
    ADD CONSTRAINT idi_vars_pkey
    PRIMARY KEY (schema);
ALTER TABLE idi_vars
    ADD CONSTRAINT idi_vars_table_fkey
    FOREIGN KEY (\"table\")
    REFERENCES idi_tables (schema);
")
