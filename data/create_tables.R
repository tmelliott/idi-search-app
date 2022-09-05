create_tables <- function() {

    if (getRversion() < numeric_version('4.1.0'))
        stop("Script required R >= 4.1.0.")

    # create tables to load into POSTGRES database ... limit (for now) of 10k rows
    library(tidyverse)
    library(googledrive)
    library(dotenv)

    drive_auth(Sys.getenv("GOOGLE_EMAIL"))
    g_files <- drive_ls(file.path(Sys.getenv("GOOGLE_PATH"), "Dictionaries")) |>
        filter(str_detect(name, "data_dictionary"))

    td <- tempdir()
    fdir <- file.path(td, "tables")
    if (dir.exists(fdir)) unlink(fdir, TRUE, TRUE)
    dir.create(fdir)
    on.exit(unlink(fdir, TRUE, TRUE))

    options(
        googledrive_quiet = TRUE
    )

    pb <- txtProgressBar(0, nrow(g_files), style = 3L, title = "Downloading dictionaries from Google Drive")
    for (i in seq_len(nrow(g_files))) {
        drive_download(g_files$id[i], path = file.path(fdir, g_files$name[i]))
        setTxtProgressBar(pb, i)
    }
    close(pb)
    files <- list.files(fdir, full.names = TRUE)

    # saveRDS(files, "data/cache/files.rda")
    # files <- readRDS("data/cache/files.rda")

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

    cat("\n **** Starting dictionary processing ...\n")
    suppressMessages({
        collection_tables <- files |>
            lapply(\(x) {
                cat("\r* Processing dictionary", x, "...")
                x <- readxl::read_excel(x, sheet = "Index")
                di <- grep("Dataset Name", x$Index)
                dj <- di + which(is.na(x$Index[-(1:di)]))[1] - 1L
                tables <- x[(di + 1):dj, ]
                cn <- as.character(x[di, ])
                tables <- tables[!is.na(cn) & cn != "NA"]
                cn <- cn[!is.na(cn) & cn != "NA"]
                colnames(tables) <- cn
                col <- x[[2]][grep("Title", x$Index)]
                schema <- x[[2]][grep("schema", tolower(x$Index))]
                if (length(schema) == 0) {
                    schema <- c("UNKNOWN", tolower(make.names(col)))
                } else {
                    schema <- strsplit(schema, "].[", fixed = TRUE)[[1]]
                    schema <- gsub("\\[|\\]", "", schema)
                }
                tables <- tables[!is.na(tables[[3]]), ]
                colnames(tables) <- tolower(make.names(colnames(tables)))
                list(
                    collection = tibble(
                        collection_schema = schema[2],
                        collection_name = col,
                        database_id = stringr::str_trim(tolower(schema[1])),
                        description = x[[2]][grep("Introduction", x$Index)],
                    ),
                    tables = tables |>
                        mutate(
                            collection_name = col,
                            dataset_id =
                                gsub("\\[|\\]", "", tables$idi.table.name)
                        )
                )
            })
    })
    cat("\r* Processing complete!\n")

    collections <- map(collection_tables, "collection") |>
        bind_rows() |>
        left_join(agency_collection) |>
        select(collection_schema, collection_name, agency_id, description) |>
        mutate(agency_id = ifelse(is.na(agency_id), "U", agency_id))

    if (any(collections$agency_id == "U")) {
        cat("The following collections have yet to be assigned agencies (in agencies.yaml)\n")
        collections |> filter(agency_id == "U") |>
            select(collection_name) |>
            as.data.frame() |> print()
    }

    # temporary:
    if (any(table(collections$collection_name) > 1L)) {
        tbl <- table(collections$collection_name)
        tbl <- tbl[tbl > 1L]
        print(tbl[tbl > 1L])
        stop("BAD COLLECTION NAMES")
    }

    datasets <- map(collection_tables, "tables") |>
        bind_rows() |>
        rename(
            dataset_name = "dataset.name",
            description = "description",
            reference_period = "reference.period"
        ) |>
        mutate(
            dataset_id = gsub("*", "", dataset_id, fixed = TRUE),
            dataset_name = gsub("*", "", dataset_name, fixed = TRUE),
            dataset_id = gsub("^\\[?IDI\\_Adhoc\\]?\\.", "", dataset_id)
        ) |>
        select(dataset_id, dataset_name, collection_name, description, reference_period) |>
        mutate(dataset_id = stringr::str_trim(tolower(dataset_id)))

    if (any(grepl("\n", datasets$dataset_id))) {
        datasets <- datasets |>
            mutate(dataset_id = gsub("\n", "__", dataset_id))
    }

    if (any((datasets$dataset_id |> tolower() |> table()) > 1L)) {
        stop("Duplicate dataset IDs")
    }

    repair_colnames <- function(x, expr, name) {
        if (any(grepl(expr, x))) x[grep(expr, x)] <- name
        x
    }

    variables <- files |>
        lapply(readxl::read_excel, sheet = 2L) |>
        lapply(\(x) {
            # fix names of things
            cn <- tolower(make.names(colnames(x)))
            cn <- cn |>
                repair_colnames("table.name", "schema") |>
                repair_colnames("^variable.name|^field.name", "variable_id") |>
                repair_colnames("des.+ion", "description") |>
                repair_colnames("additional.+information", "information") |>
                repair_colnames("plain.english", "variable_name") |>
                repair_colnames("primary", "primary_key")
            colnames(x) <- cn
            if (is.null(x[["variable_name"]])) x$variable_name <- x$variable_id
            if (is.null(x[["type"]])) x$type <- NA_character_
            if (is.null(x[["size"]])) x$size <- NA_integer_

            if (is.character(x$size)) {
                x <- x |> mutate(
                    size = sapply(lapply(strsplit(size, ","), as.integer), sum)
                )
            }

            x |>
                mutate(size = as.integer(size)) |>
                select(
                    any_of(
                        c("schema", "variable_id", "variable_name", "type",
                        "size", "description", "information", "primary_key")
                    )
                )
        }) |>
        bind_rows() |>
        mutate(
            primary_key = !is.na(primary_key) & primary_key == "Y",
            schema = str_replace_all(schema, "\\[|\\]", ""),
            variable_id = str_replace_all(variable_id, "\\[|\\]", ""),
            variable_name = str_replace_all(variable_name, "\\[|\\]", ""),
            dataset_id = str_replace(schema, "IDI_Adhoc\\.", ""),
            dataset_id = str_replace(dataset_id, "\n", "__"),
            database_id = ifelse(str_detect(schema, "IDI_Adhoc"), "IDI_Adhoc", "IDI_Clean")
        ) |>
        select(variable_id, variable_name, dataset_id, database_id, description, information,
            primary_key, type, size) |>
        mutate(
            variable_id = stringr::str_trim(tolower(variable_id)),
            dataset_id = stringr::str_trim(tolower(dataset_id))
        ) |>
        distinct()

    if (any((with(variables, paste(variable_id, dataset_id)) |> tolower() |> table()) > 1L)) {
        stop("Duplicate variable-dataset IDs")
    }

    collections <- datasets |>
        right_join(
            variables |> select(dataset_id, database_id) |> distinct()
        ) |>
        filter(!is.na(collection_name)) |>
        select(collection_name, database_id) |>
        distinct() |>
        left_join(collections) |>
        mutate(
            collection_id = make.names(gsub("\\s", "_", collection_name))
        ) |>
        select(collection_id, collection_name, agency_id, database_id, description)

    variables <- variables |>
        select(-database_id) |>
        rename(type_dict = type)

    source("data/link_refresh_data.R")
    refresh_vars <- get_refresh_vars()

    # saveRDS(refresh_vars, "data/cache/refresh_vars.rda")
    # refresh_vars <- readRDS("data/cache/refresh_vars.rda")

    if (any((with(refresh_vars, paste(variable_id, dataset_id)) |> tolower() |> table()) > 1)) {
        stop("Duplicate refresh_vars")
    }

    all_variables <- variables |>
        full_join(refresh_vars |> mutate(dataset_id = stringr::str_trim(tolower(dataset_id))),
            by = c("variable_id", "dataset_id")
        )

    if (any((with(all_variables, paste(variable_id, dataset_id)) |> tolower() |> table()) > 1)) {
        stop("Duplicate variables (after join)")
    }

    # # variables in dictionaries not in IDI:
    miss_idi <- variables |>
        anti_join(refresh_vars, by = c("variable_id", "dataset_id")) |>
        mutate(variable_name = gsub("\n", "", variable_name))

    write_csv(miss_idi |> select(variable_id, variable_name, dataset_id),
        file = "data/missing_in_idi.csv"
    )

    # # variables in IDI not in dictionaries:
    miss_dd <- refresh_vars |>
        anti_join(variables, by = c("variable_id", "dataset_id"))

    write_csv(miss_dd,
        file = "data/missing_in_dictionaries.csv"
    )

    datasets <- datasets |>
        left_join(collections |> select(collection_name, collection_id)) |>
        select(dataset_id, dataset_name, collection_id, description, reference_period)

    # add datasets from all_variables missing:
    datasets <- datasets |>
        full_join(all_variables |> select(dataset_id) |> distinct()) |>
        mutate(
            dataset_name = ifelse(is.na(dataset_name), dataset_id, dataset_name)
        )

    tbl <- table(with(all_variables, paste(variable_id, dataset_id)))
    if (any(tbl > 1L)) {
        stop("DUPLICATED VARIABLES")
    }

    # isin <- all_variables$dataset_id %in% datasets$dataset_id
    # if (!all(isin)) {
    #     print(all_variables[!isin, c("variable_id", "dataset_id")] |> as.data.frame())
    #     warning("NOT ALL VARS IN DATABASE")
    # }

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
    all_variables$description <- fix_text(all_variables$description)
    all_variables$variable_name <- gsub("\n", "", all_variables$variable_name)

    # agencies <- agencies |> filter(agency_id %in% unique(collections$agency_id))

    all_variables <- all_variables |> select(-type_dict)

    collection_schemas <- readxl::read_excel('data/collection_schemas.xlsx') |>
        setNames(c("collection_name", "agency_name", "schema"))

    # # duplicate dataset IDs (with different case)
    # datasets$dataset_id <- tolower(datasets$dataset_id)
    # all_variables$dataset_id <- tolower(all_variables$dataset_id)

    ## add in dataset IDs
    missing_collection_datasets <- datasets |>
        filter(is.na(collection_id)) |>
        pull(dataset_id) |>
        purrr::map_dfr(\(x) {
            y <- stringr::str_replace(x, "IDI_Adhoc.", "")
            y <- stringi::stri_split(y, regex = "\\.")[[1]]
            tibble(schema = y[1], dataset_id = x) #paste(y[-1], collapse = "."))
        }) |>
        # left_join(collection_schemas) |>
        fuzzyjoin::fuzzy_left_join(collection_schemas, by = "schema",
            \(x, y) tolower(x) == tolower(y)
        ) |>
        mutate(collection_id = schema.x) |>
        select(-schema.x, -schema.y) |>
        # left_join(datasets)
        mutate(
            dataset_id = gsub("}", "\\}", gsub("{", "\\{", dataset_id, fixed = TRUE), fixed = TRUE)
        ) |>
        fuzzyjoin::fuzzy_left_join(datasets,
            by = c("dataset_id", "collection_id"),
            \(x, y) tolower(x) == tolower(y)
        ) |>
        mutate(
            dataset_id = dataset_id.x,
            collection_id = collection_id.x
        ) |>
        select(dataset_id, dataset_name, collection_id, description, reference_period)

    all_datasets <- datasets |>
        filter(!is.na(collection_id)) |>
        # filter(!tolower(dataset_id) %in% tolower(missing_collection_datasets$dataset_id)) |>
        bind_rows(missing_collection_datasets)

    collections <- collection_schemas |>
        filter(schema %in% missing_collection_datasets$collection_id) |>
        mutate(
            collection_id = schema,
            agency_id = agency_name,
            database_id = "",
            description = ""
        ) |>
        select(-schema, -agency_name) |>
        bind_rows(collections)

    # datasets <- datasets |> select(-collection_name, -agency_name)

    agencies <- agencies |> filter(agency_id %in% unique(collections$agency_id))

    ## fix up variable dataset_ids
    # variables <- all_variables |>
    #     fuzzyjoin::fuzzy_left_join(datasets,
    #         by = "dataset_id",
    #         \(x, y) tolower(x) == tolower(y)
    #     ) |>
    #     mutate(
    #         dataset_id = ifelse(is.null(dataset_id.y), dataset_id.x, dataset_id.y),
    #         description = description.x
    #     ) |>
    #     select(-dataset_id.x, -dataset_id.y, -description.x, -description.y)


    ### --- renamed variables/tables information
    match_file <- drive_ls(file.path(Sys.getenv("GOOGLE_PATH"))) |>
        filter(name == "Renamed variables and tables")
    drive_download(match_file$id[1], path = file.path(fdir, "matches.xlsx"))
    match_tables <- readxl::read_excel(file.path(fdir, "matches.xlsx"),
        sheet = "Tables") |>
        rename(
            table_id = 'Table Name',
            alt_table_id = 'Alternative Name',
            notes = 'Notes'
        ) |>
        mutate(
            notes = as.character(notes)
        )
    match_variables <- readxl::read_excel(file.path(fdir, "matches.xlsx"),
        sheet = "Variables") |>
        rename(
            table_id = "Table",
            variable_id = "Variable Name",
            alt_variable_id = "Alternative Name",
            notes = "Notes"
        ) |>
        mutate(
            notes = as.character(notes)
        )

    readr::write_csv(all_variables, "data/out/variables.csv")
    readr::write_csv(datasets, "data/out/datasets.csv")
    readr::write_csv(collections, "data/out/collections.csv")
    readr::write_csv(agencies, "data/out/agencies.csv")
    readr::write_csv(match_variables, "data/out/variable_matches.csv")
    readr::write_csv(match_tables, "data/out/table_matches.csv")

    # if (isTRUE(Sys.getenv("DEPLOY") != "yes")) {
    #     message("Building complete - to confirm run, specify environment variable DEPLOY=yes")
    #     return()
    # }

    # stop("NOT WORKING")

    # # create new table..
    # # TODO: pscale deployment request, etc ...

    # library(RMySQL)
    # library(dbplyr)

    # dotenv::load_dot_env()

    # con <- dbConnect(
    #     MySQL(),
    #     user = "root",
    #     host = "127.0.0.1",
    #     port = 3309,
    #     dbname = "idisearchapp"
    #     # user = Sys.getenv("PG_USER"),
    #     # password = Sys.getenv("PG_PASSWORD"),
    #     # host = Sys.getenv("PG_HOST"),
    #     # port = Sys.getenv("PG_PORT"),
    #     # dbname = Sys.getenv("PG_DATABASE")
    # )

    # # dbExecute(con, "DROP TABLE IF EXISTS variables;")
    # # dbExecute(con, "DROP TABLE IF EXISTS datasets;")
    # # dbExecute(con, "DROP TABLE IF EXISTS collections;")
    # # dbExecute(con, "DROP TABLE IF EXISTS agencies;")
    # # dbExecute(con, "DROP TABLE IF EXISTS variable_matches;")
    # # dbExecute(con, "DROP TABLE IF EXISTS table_matches;")

    # # CREATE TABLE idi_tables (
    # #     schema TEXT PRIMARY KEY,
    # #     collection TEXT,
    # #     \"table\" TEXT,
    # #     description TEXT
    # # );
    # # CREATE TABLE idi_vars (
    # #     schema TEXT PRIMARY KEY,
    # #     \"table\" TEXT REFERENCES idi_tables (schema),
    # #     name TEXT,
    # #     description TEXT,
    # #     information TEXT
    # # );
    # # ")

    # db_insert_into(con, "agencies", agencies)

    # dbWriteTable(con, "agencies", agencies, row.names = FALSE)
    # dbWriteTable(con, "collections", collections, row.names = FALSE)
    # dbWriteTable(con, "datasets", datasets, row.names = FALSE)
    # dbWriteTable(con, "variables", all_variables, row.names = FALSE)
    # dbWriteTable(con, "variable_matches", match_variables, row.names = FALSE)
    # dbWriteTable(con, "table_matches", match_tables, row.names = FALSE)

    # dbExecute(con, "
    # ALTER TABLE agencies
    #     ADD CONSTRAINT agencies_pkey
    #     PRIMARY KEY (agency_id);

    # ALTER TABLE collections
    #     ADD CONSTRAINT collections_pkey
    #     PRIMARY KEY (collection_id);
    # ALTER TABLE collections
    #     ADD CONSTRAINT collection_agency_fkey
    #     FOREIGN KEY (agency_id)
    #     REFERENCES agencies (agency_id);

    # ALTER TABLE datasets
    #     ADD CONSTRAINT datasets_pkey
    #     PRIMARY KEY (dataset_id);
    # ALTER TABLE datasets
    #     ADD CONSTRAINT dataset_collection_fkey
    #     FOREIGN KEY (collection_id)
    #     REFERENCES collections (collection_id);

    # ALTER TABLE variables
    #     ADD CONSTRAINT variables_pkey
    #     PRIMARY KEY (variable_id, dataset_id);
    # ALTER TABLE variables
    #     ADD CONSTRAINT variable_dataset_fkey
    #     FOREIGN KEY (dataset_id)
    #     REFERENCES datasets (dataset_id);
    # ")

}

create_tables()
