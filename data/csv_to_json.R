# create table information
idi <- readr::read_csv("idi.csv", show_col_types = FALSE)
idi <- idi |> dplyr::select(schema, table_name, collection, agency) |> unique()
jsonlite::write_json(idi, "tables.json")

# run manually, converts data files to JSON
csvs <- list.files(pattern = ".csv")
for (csv in csvs) {
    d <- readr::read_csv(csv, show_col_types = FALSE)
    jsonlite::write_json(d, gsub("csv", "json", csv))
}
