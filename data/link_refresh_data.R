# links refresh information from IDI VarList

link_data <- function(variables) {

    library(tidyverse)

    ## Read vars from varlists:
    files <- list.files(file.path("data", "refreshes"), full.names = TRUE)

    all_vars <-
        lapply(files, readxl::read_excel) |>
        bind_rows() |>
        mutate(
            dataset_id = paste(TABLE_SCHEMA, TABLE_NAME, sep = ".")
        ) |>
        rename(
            catalog = TABLE_CATALOG,
            variable_id = COLUMN_NAME
        ) |>
        select(catalog, dataset_id, variable_id) |>
        mutate(
            catalog = gsub("IDI(_Clean)?_", "", catalog)
        )

    refresh_vars <- all_vars |>
        # filter(str_detect(catalog, "[0-9]+")) |>
        mutate(refresh = catalog) |>
        pivot_wider(names_from = catalog, values_from = refresh, values_fill = NA)

    refresh_vars <- refresh_vars |>
        mutate(
            refreshes = refresh_vars |>
                select(-(1:2)) |>
                apply(1L, \(x) paste(x[!is.na(x)], collapse = ","))
        ) |>
        select(dataset_id, variable_id, refreshes)

    variables |>
        left_join(refresh_vars, by = c("variable_id", "dataset_id"))

    # MISSING_REFRESHES <- matched_vars |> filter(is.na(refreshes))

    # final_vars <- matched_vars |> filter(!is.na(refreshes))


    # refresh_vars |>
    #     left_join(vars |> mutate(OK = 1), by = c("variable_id", "dataset_id")) |>
    #     filter(is.na(OK))
}
