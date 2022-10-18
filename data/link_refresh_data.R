# links refresh information from IDI VarList

get_refresh_vars <- function() {
    if (getRversion() < numeric_version("4.1.0")) {
        stop("Script required R >= 4.1.0.")
    }

    # create tables to load into POSTGRES database ... limit (for now) of 10k rows
    library(tidyverse)
    library(googledrive)
    library(dotenv)

    drive_auth(Sys.getenv("GOOGLE_EMAIL"))
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

    pb <- txtProgressBar(0, nrow(g_files), style = 3L, title = "Downloading refresh information from Google Drive")
    for (i in seq_len(nrow(g_files))) {
        drive_download(g_files$id[i], path = file.path(fdir, g_files$name[i]))
        setTxtProgressBar(pb, i)
    }
    close(pb)
    files <- list.files(fdir, full.names = TRUE)


    ## Read vars from varlists:
    files <- list.files(fdir, full.names = TRUE)

    suppressMessages({
        all_vars <-
            lapply(files, \(x) {
                print(x)
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
            }) |>
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
    })

    ## fix up duplicates
    all_vars <- all_vars |>
        group_by(dataset_id, variable_id) |>
        mutate(type = first(type)) |>
        ungroup() |>
        distinct()

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

    refresh_vars

    # variables |>
    #     left_join(refresh_vars, by = c("variable_id", "dataset_id"))

    # MISSING_REFRESHES <- matched_vars |> filter(is.na(refreshes))

    # final_vars <- matched_vars |> filter(!is.na(refreshes))


    # refresh_vars |>
    #     left_join(vars |> mutate(OK = 1), by = c("variable_id", "dataset_id")) |>
    #     filter(is.na(OK))
}
