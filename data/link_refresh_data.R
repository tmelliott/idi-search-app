# links refresh information from IDI VarList
link_refresh_data <- function() {
    if (getRversion() < numeric_version("4.1.0")) {
        stop("Script required R >= 4.1.0.")
    }

    # create tables to load into POSTGRES database ... limit (for now) of 10k rows
    cli::cli_progress_step("Setting up environment")
    suppressPackageStartupMessages({
        library(tidyverse)
        library(googledrive)
        library(dotenv)
    })

    suppressMessages(drive_auth(Sys.getenv("GOOGLE_EMAIL")))
    g_files <- drive_ls(file.path(Sys.getenv("GOOGLE_PATH"), "Variable Lists")) |>
        filter(str_detect(name, "varlist"))

    td <- tempdir()
    fdir <- file.path(td, "refreshes")
    if (dir.exists(fdir)) unlink(fdir, TRUE, TRUE)
    dir.create(fdir)
    on.exit(unlink(fdir, TRUE, TRUE))

    options(
        googledrive_quiet = TRUE
    )

    z <- lapply(
        cli::cli_progress_along(seq_len(nrow(g_files)),
            name = "Downloading refresh lists from Google Drive"
        ),
        \(i) drive_download(g_files$id[i], path = file.path(fdir, g_files$name[i]))
    )

    ## Read vars from varlists:
    cli::cli_progress_step("Reading files")
    files <- list.files(fdir, full.names = TRUE)
    refreshes <- lapply(
        files,
        \(x) suppressMessages({
            sheets <- readxl::excel_sheets(x)
            sheets <- sheets[grepl("^varlist", tolower(sheets))]
            lapply(sheets, \(z) {
                readxl::read_excel(x, sheet = z) |>
                    select(
                        TABLE_CATALOG, TABLE_SCHEMA, TABLE_NAME,
                        COLUMN_NAME, DATA_TYPE
                    )
            }) |>
                bind_rows()
        })
    )

    cli::cli_progress_step("Merging variables")
    all_vars <- refreshes |>
        bind_rows() |>
        mutate(
            dataset_id = paste(TABLE_SCHEMA, TABLE_NAME, sep = ".")
        ) |>
        rename(
            database = TABLE_CATALOG,
            variable_id = COLUMN_NAME,
            type = DATA_TYPE
        ) |>
        select(database, dataset_id, variable_id, type) |>
        mutate(
            database = gsub("IDI(_Clean)?_", "", database),
            variable_id = stringr::str_trim(tolower(variable_id)),
            dataset_id = stringr::str_trim(tolower(dataset_id))
        ) |>
        distinct()

    # Delete datasets in 'to_delete.yaml'
    to_delete <- yaml::read_yaml("data/to_delete.yaml")
    all_vars <- all_vars |>
        filter(!dataset_id %in% to_delete$datasets)

    ## fix up duplicates
    cli::cli_progress_step("Removing duplicates")
    all_vars <- all_vars |>
        group_by(dataset_id, variable_id) |>
        mutate(type = first(type)) |>
        ungroup() |>
        distinct()

    cli::cli_progress_step("Creating refresh column")
    refresh_vars <- all_vars |>
        mutate(refresh = database) |>
        pivot_wider(names_from = database, values_from = refresh, values_fill = NA)

    refresh_vars <- refresh_vars |>
        mutate(
            refreshes = refresh_vars |>
                select(-(1:3)) |>
                apply(1L, \(x) paste(x[!is.na(x)], collapse = ","))
        ) |>
        select(dataset_id, variable_id, type, refreshes)

    cli::cli_progress_done()

    refresh_vars
    # variables |>
    #     left_join(refresh_vars, by = c("variable_id", "dataset_id"))

    # MISSING_REFRESHES <- matched_vars |> filter(is.na(refreshes))

    # final_vars <- matched_vars |> filter(!is.na(refreshes))


    # refresh_vars |>
    #     left_join(vars |> mutate(OK = 1), by = c("variable_id", "dataset_id")) |>
    #     filter(is.na(OK))
}
