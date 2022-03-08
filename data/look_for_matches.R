# look for matches between idi missing and DD missing variables:
library(stringdist)

idi <- readr::read_csv("data/missing_in_idi.csv", show_col_types = FALSE)
dd <- readr::read_csv("data/missing_in_dictionaries.csv", show_col_types = FALSE)

idi <- idi |> dplyr::select(variable_id, dataset_id)
dd <- dd |> dplyr::select(variable_id, dataset_id)

idi_groups <- tapply(seq_len(nrow(idi)), idi$dataset_id, \(i) idi[i, ])

group <- idi_groups$acc_clean.claims

find_matches <- function(group) {
    d_id <- group$dataset_id[1]
    dd_group <- dd |> dplyr::filter(dataset_id == d_id)
    match_mat <- stringdistmatrix(
        group$variable_id,
        dd_group$variable_id
    )
    min_match <- apply(match_mat, 1L, min)
    best_match <- apply(match_mat, 1L, which.min)
    tibble::tibble(
        variable = group$variable_id,
        best_match = dd_group$variable_id[best_match],
        distance = min_match
    ) |> View()
}
