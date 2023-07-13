# create_tables <- function() {
if (getRversion() < numeric_version("4.1.0")) {
    stop("Script required R >= 4.1.0.")
}

# create tables to load into POSTGRES database ... limit (for now) of 10k rows
suppressPackageStartupMessages({
    library(tidyverse)
    library(googledrive)
    library(dotenv)
})

cli::cli_h1("Downloading dictionaries from Goolge Drive")

cli::cli_progress_step("Authenticating with Google Drive")
drive_auth(Sys.getenv("GOOGLE_EMAIL"))

cli::cli_progress_step("Setting up temporary directory")
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

suppressPackageStartupMessages(library(parallel))
cli::cli_progress_step("Initializing cluster")

cl <- makeCluster(12L)
clusterExport(cl, c("g_files", "fdir"))
z <- clusterEvalQ(cl, googledrive::drive_auth(Sys.getenv("GOOGLE_EMAIL")))
cli::cli_progress_done()

pbapply::pboptions(type = "timer")
cli::cli_alert("Downloading dictionaries ...")
z <- pbapply::pblapply(
    seq_len(nrow(g_files)),
    \(i) {
        googledrive::drive_download(
            g_files$id[i],
            path = file.path(fdir, g_files$name[i])
        )
    },
    cl = cl
)
cli::cli_alert_success("Dictionaries downloaded")

cli::cli_progress_step("Shutting down cluster")
stopCluster(cl)

cli::cli_progress_done()

cli::cli_h1("Reading data dictionaries")

files <- list.files(fdir, full.names = TRUE)

cli::cli_progress_step("Reading agencies")
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


fixTableNames <- function(names) {
    names <- tolower(make.names(names))
    names[grepl("idi.table", names)] <- "idi.table.name"
    names
}

cli::cli_progress_step("Processing dictionaries")
suppressMessages({
    collection_tables <- files |>
        lapply(\(file) {
            # cat("\r* Processing dictionary", x, "...")
            x <- readxl::read_excel(file, sheet = "Index")
            di <- grep("Dataset Name", x$Index)
            dj <- di + which(is.na(x$Index[-(1:di)]))[1] - 1L
            tables <- x[(di + 1):dj, ]
            cn <- as.character(x[di, ])
            tables <- tables[!is.na(cn) & cn != "NA"]
            cn <- cn[!is.na(cn) & cn != "NA"]
            colnames(tables) <- cn
            col <- gsub("\\r|\\n", "", x[[2]][grep("Title", x$Index)])
            schema <- x[[2]][grep("schema", tolower(x$Index))]
            if (length(schema) == 0) {
                schema <- c("UNKNOWN", tolower(make.names(col)))
            } else {
                schema <- strsplit(schema, "].[", fixed = TRUE)[[1]]
                schema <- gsub("\\[|\\]", "", schema)
            }
            tables <- tables[!is.na(tables[[3]]), ]
            colnames(tables) <- fixTableNames(colnames(tables))

            # is there a 'Codes & Values' sheet?
            sheet_names <- readxl::excel_sheets(file)
            has_codes <- stringr::str_detect(
                tolower(sheet_names),
                "codes.+values"
            )
            codes <- NULL
            if (sum(has_codes) == 1) {
                codes <- readxl::read_excel(file,
                    sheet = sheet_names[has_codes]
                )
                code_cols <- tolower(colnames(codes))
                variable_col <- grep("variable.+name", code_cols)[1]
                code_col <- which(grepl("code", code_cols) &
                    !grepl("label", code_cols))[1]
                label_col <- grep("label", code_cols)[1]

                codes <- tibble::tibble(
                    variable_id = tolower(trimws(codes[[variable_col]])),
                    code = tolower(trimws(codes[[code_col]])),
                    label = tolower(trimws(codes[[label_col]]))
                )
            }

            # grab keywords, if they exist
            kwd_row <- grep("Keywords", x$Index)
            keywords <- character()
            if (length(kwd_row) > 0) {
                keywords <- trimws(
                    strsplit(x[[2]][kwd_row], ";", fixed = TRUE)[[1]]
                )
            }

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
                            gsub("\\[|\\]", "", tables$idi.table.name),
                        dd_order = seq_len(n())
                    ),
                codes = codes,
                keywords = stringr::str_to_title(keywords)
            )
        })
})

cli::cli_progress_step("Extracting collections")
collections <- map(collection_tables, "collection") |>
    bind_rows() |>
    left_join(agency_collection, by = "collection_name") |>
    select(collection_schema, collection_name, agency_id, description) |>
    mutate(agency_id = ifelse(is.na(agency_id), "U", agency_id))
cli::cli_progress_done()

if (any(collections$agency_id == "U")) {
    d <- cli::cli_div(
        theme = list(
            rule = list(
                color = "red"
            )
        )
    )
    cli::cli_rule()
    cli::cli_alert_warning(
        cli::style_bold(
            cli::col_red(
                "The following collections have yet to be assigned agencies (in agencies.yaml)"
            )
        )
    )
    collections |>
        filter(agency_id == "U") |>
        pull(collection_name) |>
        sapply(\(x) cli::col_red(x)) |>
        cli::cli_ul()
    cli::cli_rule()
    cli::cli_end(d)
}

# temporary:
if (any(table(collections$collection_name) > 1L)) {
    tbl <- table(collections$collection_name)
    tbl <- tbl[tbl > 1L]
    cli::cli_alert_danger("Bad collection names")
    cli::cli_ul(tbl[tbl > 1L])
    stop()
}

cli::cli_progress_step("Extracing datasets")
datasets <- suppressMessages(
    map(collection_tables, "tables") |>
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
        select(dataset_id, dataset_name, collection_name, dd_order, description, reference_period) |>
        mutate(dataset_id = stringr::str_trim(tolower(dataset_id)))
)

if (any(grepl("\n", datasets$dataset_id))) {
    datasets <- datasets |>
        mutate(dataset_id = gsub("\n", "__", dataset_id))
}

dup_ids <- datasets$dataset_id |>
    tolower() |>
    table()
if (any(dup_ids > 1L)) {
    d <- cli::cli_div(
        theme = list(
            rule = list(
                color = "red"
            )
        )
    )
    cli::cli_rule()
    cli::cli_alert_danger(
        cli::style_bold(
            cli::col_red(
                "Duplicate dataset IDs"
            )
        )
    )
    cli::cli_ul(dup_ids[dup_ids > 1])
    stop()
}

cli::cli_progress_step("Extracing codes and values")
codes <- map(collection_tables, "codes") |>
    bind_rows() |>
    mutate(
        variable_id = str_replace_all(variable_id, "\\[|\\]", "")
    ) |>
    filter(!is.na(code) & !is.na(label))

cli::cli_progress_step("Extracting keywords")
keywords <- lapply(
    collection_tables,
    \(x) {
        if (length(x$keywords) == 0) {
            return(NULL)
        }
        cbind(
            collection_name = x$collection$collection_name[1],
            keyword = x$keywords
        ) |>
            as_tibble()
    }
) |>
    bind_rows() |>
    distinct()


repair_colnames <- function(x, expr, name) {
    if (any(grepl(expr, x))) x[grep(expr, x)] <- name
    x
}

cli::cli_progress_step("Loading variables")
sheets <- lapply(
    files,
    \(x) suppressMessages(readxl::read_excel(x, sheet = 2L))
)

cli::cli_progress_step("Parsing variable information")
variables <- sheets |>
    lapply(\(x) {
        # fix names of things
        cn <- tolower(make.names(colnames(x)))
        cn <- cn |>
            repair_colnames("table.name", "schema") |>
            repair_colnames("^(idi.)?variable.name|^(idi.)?field.name", "variable_id") |>
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
                size = suppressWarnings(sapply(lapply(strsplit(size, ","), as.integer), sum))
            )
        }

        x |>
            mutate(
                size = as.integer(size),
                dd_order = seq_len(n())
            ) |>
            select(
                any_of(
                    c(
                        "schema", "variable_id", "variable_name", "type",
                        "size", "description", "information", "primary_key",
                        "dd_order"
                    )
                )
            )
    })

cli::cli_progress_step("Combining variable lists")
variables <- variables |>
    bind_rows() |>
    mutate(
        primary_key = !is.na(primary_key) & primary_key == "Y",
        schema = str_replace_all(schema, "\\[|\\]", ""),
        variable_id = str_replace_all(variable_id, "\\[|\\]", ""),
        variable_name = str_replace_all(variable_name, "\\[|\\]", ""),
        dataset_id = str_replace(schema, "IDI_Adhoc\\.", ""),
        dataset_id = str_replace(dataset_id, "\n", "__"),
        database_id = ifelse(
            str_detect(schema, "IDI_Adhoc"),
            "IDI_Adhoc",
            "IDI_Clean"
        )
    ) |>
    select(
        variable_id, variable_name, dataset_id, database_id,
        description, information, primary_key, type, size, dd_order
    ) |>
    mutate(
        variable_id = stringr::str_trim(tolower(variable_id)),
        dataset_id = stringr::str_trim(tolower(dataset_id))
    ) |>
    distinct(variable_id, variable_name, dataset_id, database_id,
        description, information, primary_key, type, size,
        .keep_all = TRUE
    )

vid_tab <- with(variables, paste(variable_id, dataset_id)) |>
    tolower() |>
    table()
if (any(vid_tab > 1L)) {
    cli::cli_alert_danger("Duplicate variable-dataset IDs")
    cli::cli_ul(vid_tab[vid_tab > 1L])
    stop("Duplicate IDs")
}

cli::cli_progress_done()

variables <- variables |>
    select(-database_id) |>
    rename(type_dict = type)

cli::cli_h1("Loading IDI variable lists")
cli::cli_progress_step("Loading")
source("data/link_refresh_data.R")
refresh_vars <- link_refresh_data()

cli::cli_progress_step("Downloading regex matches file")
cs_file <- drive_ls(file.path(Sys.getenv("GOOGLE_PATH"))) |>
    filter(name == "Regex matches")
drive_download(
    cs_file$id[1],
    path = file.path(fdir, "regex_matches.xlsx")
)

cli::cli_progress_step("Reading regex matches file")
regex_matches <-
    readxl::read_excel(file.path(fdir, "regex_matches.xlsx")) |>
    setNames(c("dd_name", "regex_name")) |>
    dplyr::mutate(
        dd_name = tolower(dd_name),
        regex_name = tolower(regex_name)
    )

## REFRESH variables and their REGEX matched dictionary
regex_matched_datasets <- apply(regex_matches, 1L, \(x) {
    refresh_vars[grep(x[["regex_name"]], refresh_vars$dataset_id), ] |>
        mutate(
            dd_dataset_id = x[["dd_name"]]
        ) |>
        select(dataset_id, dd_dataset_id) |>
        distinct()
}) |> bind_rows()


# saveRDS(refresh_vars, "data/cache/refresh_vars.rda")
# refresh_vars <- readRDS("data/cache/refresh_vars.rda")

if (any((with(refresh_vars, paste(variable_id, dataset_id)) |> tolower() |> table()) > 1)) {
    stop("Duplicate refresh_vars")
}

cli::cli_progress_step("Merging refresh variables to dictionary variables")
all_variables <- variables |>
    right_join(
        refresh_vars |>
            mutate(dataset_id = stringr::str_trim(tolower(dataset_id))),
        by = c("variable_id", "dataset_id")
    ) |>
    mutate(
        database_id = ifelse(grepl("Adhoc", refreshes), "Adhoc", "Clean")
    ) |>
    mutate(dd_order = ifelse(is.na(dd_order), 0, dd_order))

if (any((with(all_variables, paste(variable_id, dataset_id)) |> tolower() |> table()) > 1)) {
    stop("Duplicate variables (after join)")
}

## some instances of datasets with different types across versions
most_common <- function(x) {
    if (length(unique(x)) == 1) {
        return(unique(x))
    }

    names(sort(table(x), decreasing = TRUE))[1]
}

## replace dataset_id with dd_dataset_id if it exists
av <- all_variables |>
    filter(dataset_id %in% regex_matched_datasets$dataset_id) |>
    left_join(regex_matched_datasets, by = "dataset_id") |>
    mutate(dataset_id = dd_dataset_id) |>
    select(-dd_dataset_id) |>
    group_by(across(-type)) |>
    summarize(type = most_common(type)) |>
    ungroup() |>
    distinct() |>
    bind_rows(
        all_variables |>
            filter(!dataset_id %in% regex_matched_datasets$dataset_id)
    )
all_variables <- av

cli::cli_progress_step("Merging datasets")
datasets <- datasets |>
    right_join(
        all_variables |> select(dataset_id, database_id) |> distinct(),
        by = "dataset_id"
    ) |>
    mutate(
        dd_order = ifelse(is.na(dd_order), 0, dd_order),
    )

cli::cli_progress_step("Merging collections")
collections <- datasets |>
    filter(!is.na(collection_name)) |>
    select(collection_name, database_id) |>
    distinct() |>
    group_by(collection_name) |>
    summarize(database_id = paste(sort(database_id), collapse = "|")) |>
    left_join(collections, by = "collection_name") |>
    mutate(
        collection_id = make.names(gsub("\\s", "_", collection_name))
    ) |>
    select(collection_id, collection_name, agency_id, database_id, description)

# # variables in dictionaries not in IDI:
cli::cli_progress_step("Computing missingness information")
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

cli::cli_progress_step("Linking datasets with their collection ID")
datasets <- datasets |>
    left_join(collections |> select(collection_name, collection_id),
        by = "collection_name"
    ) |>
    select(dataset_id, dataset_name, collection_id, dd_order, description, reference_period)

# add datasets from all_variables missing:
datasets <- datasets |>
    full_join(all_variables |> select(dataset_id) |> distinct(),
        by = "dataset_id"
    ) |>
    mutate(
        dataset_name = ifelse(is.na(dataset_name), dataset_id, dataset_name)
    )

tbl <- table(with(all_variables, paste(variable_id, dataset_id)))
if (any(tbl > 1L)) {
    cli::cli_alert_danger("Duplicate variables")
    cli::cli_ul(names(tbl)[tbl > 1])
    stop("")
}

# link keywords to collection_id
keywords <- keywords |>
    left_join(collections |> select(collection_name, collection_id),
        by = "collection_name"
    ) |>
    filter(!is.na(collection_id) & !is.na(keyword)) |>
    select(collection_id, keyword) |>
    distinct()

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

cli::cli_progress_step("Fixing text values")
collections$description <- fix_text(collections$description)
datasets$description <- fix_text(datasets$description)
all_variables$description <- fix_text(all_variables$description)
all_variables$variable_name <- gsub("\n", "", all_variables$variable_name)

# agencies <- agencies |> filter(agency_id %in% unique(collections$agency_id))

all_variables <- all_variables |> select(-type_dict)

cli::cli_progress_done()

cli::cli_h1("Merging manual dataset and collection information")
## manually assign some collections to datasets ...

cli::cli_progress_step("Downloading files from Google Drive")
mc_file <- drive_ls(file.path(Sys.getenv("GOOGLE_PATH"))) |>
    filter(name == "Manual dataset collections")
drive_download(
    mc_file$id[1],
    path = file.path(fdir, "manual_collections.xlsx"),
    overwrite = TRUE
)
manual_collections <- readxl::read_excel(
    file.path(fdir, "manual_collections.xlsx"),
    sheet = "Collections"
) |>
    mutate(
        collection_id = tolower(collection_id)
    )
manual_datasets <- readxl::read_excel(
    file.path(fdir, "manual_collections.xlsx"),
    sheet = "Datasets"
) |>
    mutate(
        dataset_id = tolower(dataset_id)
        # collection_id = tolower(collection_id)
    )

cli::cli_progress_step("Adding manual datasets and collections")
manual_datasets <- datasets |>
    filter(is.na(collection_id)) |>
    select(-collection_id) |>
    left_join(manual_datasets, by = "dataset_id") |>
    filter(!is.na(collection_id))

datasets <- datasets |>
    filter(!dataset_id %in% manual_datasets$dataset_id) |>
    bind_rows(manual_datasets)

collections <- manual_collections |>
    filter(!collection_id %in% collections$collection_id) |>
    bind_rows(collections)

cli::cli_progress_step("Downloading manual collection file")
cs_file <- drive_ls(file.path(Sys.getenv("GOOGLE_PATH"))) |>
    filter(name == "Collection schemas")
drive_download(
    cs_file$id[1],
    path = file.path(fdir, "collection_schemas.xlsx")
)

cli::cli_progress_step("Reading manual collections file")
collection_schemas <-
    readxl::read_excel(file.path(fdir, "collection_schemas.xlsx")) |>
    setNames(c("collection_name", "agency_name", "schema", "collection_id")) |>
    mutate(collection_id = ifelse(is.na(collection_id), schema, collection_id))

# # duplicate dataset IDs (with different case)
# datasets$dataset_id <- tolower(datasets$dataset_id)
# all_variables$dataset_id <- tolower(all_variables$dataset_id)

## add in dataset IDs
cli::cli_progress_step("Fuzzy matching variables ignoring case")
missing_collection_datasets <- datasets |>
    filter(is.na(collection_id)) |>
    pull(dataset_id) |>
    purrr::map_dfr(\(x) {
        y <- stringr::str_replace(x, "IDI_Adhoc.", "")
        y <- stringi::stri_split(y, regex = "\\.")[[1]]
        tibble(schema = y[1], dataset_id = x) # paste(y[-1], collapse = "."))
    }) |>
    # left_join(collection_schemas) |>
    fuzzyjoin::fuzzy_left_join(collection_schemas,
        by = "schema",
        \(x, y) tolower(x) == tolower(y)
    ) |>
    mutate(collection_id = ifelse(is.na(collection_id), schema.x, collection_id)) |>
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
    select(dataset_id, dataset_name, collection_id, dd_order, description, reference_period) |>
    mutate(
        dataset_name = ifelse(is.na(dataset_name),
            gsub(".+\\.", "", dataset_id),
            dataset_name
        ),
        dd_order = ifelse(is.na(dd_order), 0, dd_order)
    )

cli::cli_progress_step("Adding missing datasets and collections")
all_datasets <- datasets |>
    filter(!is.na(collection_id)) |>
    # filter(!tolower(dataset_id) %in% tolower(missing_collection_datasets$dataset_id)) |>
    bind_rows(missing_collection_datasets)

all_collections <- collection_schemas |>
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

all_agencies <- agencies |> filter(agency_id %in% unique(all_collections$agency_id))

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
cli::cli_progress_step("Downloading variable and table renaming file")
match_file <- drive_ls(file.path(Sys.getenv("GOOGLE_PATH"))) |>
    filter(name == "Renamed variables and tables")
drive_download(match_file$id[1], path = file.path(fdir, "matches.xlsx"))

cli::cli_progress_step("Looking for renamed variables and tables")
match_tables <- readxl::read_excel(file.path(fdir, "matches.xlsx"),
    sheet = "Tables"
) |>
    rename(
        table_id = "Table Name",
        alt_table_id = "Alternative Name",
        notes = "Notes"
    ) |>
    mutate(
        notes = as.character(notes)
    )
match_variables <- readxl::read_excel(file.path(fdir, "matches.xlsx"),
    sheet = "Variables"
) |>
    rename(
        table_id = "Table",
        variable_id = "Variable Name",
        alt_variable_id = "Alternative Name",
        notes = "Notes"
    ) |>
    mutate(
        notes = as.character(notes)
    )

cli::cli_progress_step("Remove unneeded datasets and collections")
all_variables <- all_variables |>
    filter(dataset_id %in% unique(all_datasets$dataset_id))

## Now filter out a bunch of databases we don't want ...
all_variables <- all_variables |>
    dplyr::filter(grepl("^data\\.|^idi\\_adhoc|^clean\\_read|\\_clean\\.", dataset_id)) |>
    dplyr::filter(!grepl("^clean_read_classifications", dataset_id)) |>
    dplyr::filter(!grepl("RnD", refreshes)) |>
    dplyr::filter(!grepl("\\_v$", dataset_id)) |>
    dplyr::filter(dataset_id != "dol_clean.grounds_code") |>
    mutate(
        variable_name = ifelse(
            is.na(variable_name),
            gsub("_", " ", variable_id, fixed = TRUE),
            variable_name
        )
    )

all_datasets <- all_datasets |>
    filter(dataset_id %in% all_variables$dataset_id) |>
    mutate(dataset_name = gsub("_", " ", dataset_name, fixed = TRUE))
all_collections <- all_collections |> filter(collection_id %in% all_datasets$collection_id)

cli::cli_progress_step("Writing files")
readr::write_csv(all_variables, "data/out/variables.csv")
readr::write_csv(all_datasets, "data/out/datasets.csv")
readr::write_csv(all_collections, "data/out/collections.csv")
readr::write_csv(all_agencies, "data/out/agencies.csv")
readr::write_csv(match_variables, "data/out/variable_matches.csv")
readr::write_csv(match_tables, "data/out/table_matches.csv")
readr::write_csv(
    regex_matched_datasets |> setNames(c("dataset_id", "dataset_id_regex")),
    "data/out/datasets_regex.csv"
)
readr::write_csv(codes, "data/out/code_values.csv", quote = "all")
readr::write_csv(keywords, "data/out/keywords.csv", quote = "all")

cli::cli_progress_done()

cli::cli_alert_success("Completed dictionary and variable processing!")

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
# }

# create_tables()
