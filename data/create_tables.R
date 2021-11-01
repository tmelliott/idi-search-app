if (getRversion() < numeric_version('4.1.0'))
    stop("Script required R >= 4.1.0.")

# create tables to load into POSTGRES database ... limit (for now) of 10k rows
library(tidyverse)

files <- list.files(file.path("data", "dictionaries"), full.names = TRUE)

readxl::excel_sheets(files[1])

# - refresh period too

agency_collection <- yaml::read_yaml("data/agencies.yaml") |>
    lapply(\(x) {
        tibble(
            agency = x$name,
            collection = x$collections
        )
    }) |>
    bind_rows() |>
    mutate(agency = factor(agency))

agencies <- tibble(
    agency_id = seq_along(levels(agency_collection$agency)),
    agency_name = levels(agency_collection$agency)
)

agency_collection <- agency_collection |>
    mutate(agency = as.integer(agency))

collection_tables <- files |>
    lapply(readxl::read_excel, sheet = "Index") |>
    lapply(\(x) {
        di <- grep("Dataset Name", x$Index)
        dj <- di + which(is.na(x$Index[-(1:di)]))[1] - 1L
        tables <- x[(di + 1):dj, ]
        cn <- as.character(x[di, ])
        tables <- tables[!is.na(cn)]
        cn <- cn[!is.na(cn)]
        colnames(tables) <- cn
        col <- x[[2]][grep("Title", x$Index)]
        list(
            collection = tibble(
                collection = col,
                description = x[[2]][grep("Introduction", x$Index)],
            ),
            tables = tables |>
                mutate(
                    collection = col
                )
        )
    })

collections <- map(collection_tables, "collection") |>
    bind_rows() |>
    right_join(agency_collection) |>
    mutate(
        collection = factor(collection),
        collection_id = as.integer(collection),
        collection_name = as.character(collection),
        agency_id = agency
    ) |>
    select(collection_id, collection_name, agency_id, description)

datasets <- map(collection_tables, "tables") |>
    bind_rows() |>
    rename(
        dataset = "Dataset Name",
        description = "Description",
        schema = "IDI Table Name",
        reference_period = "Reference Period"
    ) |>
    right_join(
        collections |> select(collection_id, collection_name),
        by = c("collection" = "collection_name")
    ) |>
    mutate(
        dataset = as.factor(dataset),
        dataset_id = as.integer(dataset),
        dataset_name = as.character(dataset)
    ) |>
    select(dataset_id, dataset_name, collection_id, schema, description, reference_period)

variables <- files |>
    lapply(readxl::read_excel, sheet = "Dataset_Summary") |>
    bind_rows() |>
    rename(
        schema = "IDI Table Name",
        variable = "Field name",
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
        schema = str_replace_all(schema, "\\[|\\]", ""),
        variable = str_replace_all(variable, "\\[|\\]", "")
    )

## TODO:
# figure out agency (?) and collection (!) schema from variables list,
# and replace integer ID with that.

adhoc <- variables |>
    filter(str_detect(dictionaries$table_name, "IDI_Adhoc")) |>
    separate(table_name, c(NA_character_, "collection", "dataset"), "\\.")

idi <- variables |>
    filter(!str_detect(dictionaries$table_name, "IDI_Adhoc")) |>
    separate(table_name, c("collection", "dataset"), "\\.")

## -- adhoc tables are one 'section'
adhoc_tables <- adhoc |>
    select(collection, dataset) |>
    distinct()

adhoc_vars <- adhoc |>
    select(dataset, name, description, information) |>
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
    select(collection, dataset) |>
    distinct() |>
    mutate(
        schema = paste(collection, dataset, sep = "."),
        description = ""
    ) |>
    select(schema, collection, dataset, description)

idi_vars <- idi |>
    select(collection, dataset, name, description, information) |>
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
        dataset = paste(collection, dataset, sep = "."),
        schema = paste(collection, dataset, name, sep = "."),
    ) |>
    select(schema, dataset, name, description, information)

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
