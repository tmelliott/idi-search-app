if (getRversion() < numeric_version('4.1.0'))
    stop("Script required R >= 4.1.0.")

# create tables to load into POSTGRES database ... limit (for now) of 10k rows
library(tidyverse)
library(googledrive)
library(dotenv)

drive_auth(Sys.getenv("GOOGLE_EMAIL"))
g_files <- drive_ls(Sys.getenv("GOOGLE_PATH"))

td <- tempdir()
for (i in seq_len(nrow(g_files))) {
    drive_download(g_files$id[i], path = file.path(td, g_files$name[i]))
}
files <- list.files(td, full.names = TRUE)

#list.files(file.path("data", "dictionaries"), full.names = TRUE)

# readxl::excel_sheets(files[1])

# - refresh period too

agency_collection <- yaml::read_yaml("data/agencies.yaml") |>
    lapply(\(x) {
        tibble(
            agency_id = x$id,
            agency_name = x$name,
            collection_name = x$collections
        )
    }) |>
    bind_rows()

agencies <- agency_collection |>
    select(agency_id, agency_name) |>
    distinct()

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
                collection_name = col,
                description = x[[2]][grep("Introduction", x$Index)],
            ),
            tables = tables |>
                mutate(
                    collection_name = col,
                    dataset_id =
                        gsub("\\[|\\]", "", tables[["IDI Table Name"]])
                )
        )
    })

collections <- map(collection_tables, "collection") |>
    bind_rows() |>
    right_join(agency_collection) |>
    select(collection_name, agency_id, description)

datasets <- map(collection_tables, "tables") |>
    bind_rows() |>
    rename(
        dataset_name = "Dataset Name",
        description = "Description",
        reference_period = "Reference Period"
    ) |>
    select(dataset_id, dataset_name, collection_name, description, reference_period)

variables <- files |>
    lapply(readxl::read_excel, sheet = "Dataset_Summary") |>
    bind_rows() |>
    rename(
        schema = "IDI Table Name",
        variable_id = "Field name",
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
        variable_id = str_replace_all(variable_id, "\\[|\\]", ""),
        dataset_id = str_replace(schema, "IDI_Adhoc\\.", ""),
        database_id = ifelse(str_detect(schema, "IDI_Adhoc"), "IDI_Adhoc", "IDI_Clean")
    ) |>
    select(variable_id, dataset_id, database_id, description, information)

## TODO:
# figure out agency (?) and collection (!) schema from variables list,
# and replace integer ID with that.

collections <- datasets |>
    right_join(
        variables |> select(dataset_id, database_id) |> distinct()
    ) |>
    select(collection_name, database_id) |>
    distinct() |>
    left_join(collections) |>
    mutate(
        collection_id = make.names(gsub("\\s", "_", collection_name))
    ) |>
    select(collection_id, collection_name, agency_id, database_id, description)

variables <- variables |> select(-database_id) |>
    mutate(refreshes = "")

datasets <- datasets |>
    left_join(collections |> select(collection_name, collection_id)) |>
    select(dataset_id, dataset_name, collection_id, description, reference_period)

# Collection IDs

fix_text <- function(x) {
    x <- gsub("\r\n", "\n\n", x) # double new lines for markdown
    x <- gsub("\u2022", "-", x)
    x <- gsub("\u8211", "-", x)
    x <- gsub("\u2018|\u2019", "'", x)
    x <- gsub("\u201C|\u201D", "\"", x)
    x <- gsub("\n\n-", "\n-", x) # bullet lists
    x
}

collections$description <- fix_text(collections$description)
datasets$description <- fix_text(datasets$description)
variables$description <- fix_text(variables$description)

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
DROP TABLE IF EXISTS variables;
DROP TABLE IF EXISTS datasets;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS agencies;
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

dbWriteTable(con, "agencies", agencies, row.names = FALSE)
dbWriteTable(con, "collections", collections, row.names = FALSE)
dbWriteTable(con, "datasets", datasets, row.names = FALSE)
dbWriteTable(con, "variables", variables, row.names = FALSE)

dbExecute(con, "
ALTER TABLE agencies
    ADD CONSTRAINT agencies_pkey
    PRIMARY KEY (agency_id);

ALTER TABLE collections
    ADD CONSTRAINT collections_pkey
    PRIMARY KEY (collection_id);
ALTER TABLE collections
    ADD CONSTRAINT collection_agency_fkey
    FOREIGN KEY (agency_id)
    REFERENCES agencies (agency_id);

ALTER TABLE datasets
    ADD CONSTRAINT datasets_pkey
    PRIMARY KEY (dataset_id);
ALTER TABLE datasets
    ADD CONSTRAINT dataset_collection_fkey
    FOREIGN KEY (collection_id)
    REFERENCES collections (collection_id);

ALTER TABLE variables
    ADD CONSTRAINT variables_pkey
    PRIMARY KEY (variable_id, dataset_id);
ALTER TABLE variables
    ADD CONSTRAINT variable_dataset_fkey
    FOREIGN KEY (dataset_id)
    REFERENCES datasets (dataset_id);
")
