miss_idi <- readr::read_csv('data/missing_in_idi.csv')
miss_dict <- readr::read_csv('data/missing_in_dictionaries.csv')


idi_ids <- miss_dict |>
    dplyr::filter(grepl("[0-9]{5,}", dataset_id)) |>
    dplyr::select(dataset_id) |>
    dplyr::distinct() |>
    dplyr::mutate(
        dataset_id_stripped = stringr::str_replace(dataset_id, "[0-9]{5,}", ""),
        dataset_id_unique = stringr::str_match(dataset_id, "([0-9]{5,})")[,2]
    ) |>
    dplyr::select(-dataset_id) |>
    dplyr::group_by(dataset_id_stripped) |>
    dplyr::summarise(
        n = dplyr::n(),
        keys = paste(dataset_id_unique, collapse = " | ")
    ) |>
    dplyr::filter(n > 1)

unique_dd_ids <- unique(miss_idi$dataset_id[!is.na(miss_idi$dataset_id)])

# search unique_dd_ids for matching idi_ids$dataset_id_stripped

matches <- apply(idi_ids, 1, function(x) {
    m <- unique_dd_ids[stringr::str_detect(unique_dd_ids, x[1])]
    if (length(m)) {
        x <- tibble::tibble(
            id = x[1], n = as.integer(x[2]),
            keys = x[3],
            dd_ids = paste(m, collapse = " | ")
        )
        return(x)
    }
    NULL
}) |> dplyr::bind_rows()
