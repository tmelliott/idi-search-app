source("functions.R")

extract_metadata <- function() {
    temp_dir <- "tmp"
    dd_dir <- file.path(temp_dir, "dd")

    dd_files <- list.files(dd_dir, full.names = TRUE)

    cli::cli_inform(
        "Found {length(dd_files)} data dictionaries to process"
    )
}

extract <- function(dir) {
    # collection, datasets, variables
}
