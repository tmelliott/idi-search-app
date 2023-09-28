# process new files in 'NEW' folder
# Data Dictionaries: extract collection, dataset(s), and variables metadata
# Variable lists: copy to csv

source("functions.R")

process_new_files <- function() {
    connect_gdrive()

    cli::cli_progress_step("Setting up temporary directories")
    temp_dir <- "tmp"
    new_dir <- file.path(temp_dir, "new")
    dd_dir <- file.path(temp_dir, "dd")
    vl_dir <- file.path(temp_dir, "vl")
    bad_dir <- file.path(temp_dir, "bad")

    if (!dir.exists(new_dir)) dir.create(new_dir)
    if (!dir.exists(dd_dir)) dir.create(dd_dir)
    if (!dir.exists(vl_dir)) dir.create(vl_dir)
    if (!dir.exists(bad_dir)) dir.create(bad_dir)

    if (Sys.getenv("N_CORES") == "") {
        cl <- NULL
    } else {
        cli::cli_progress_step("Initializing cluster")
        suppressPackageStartupMessages(library(parallel))
        cl <- makeCluster(Sys.getenv("N_CORES", 1L))
        clusterExport(cl, c("new_dir", "dd_dir", "vl_dir"))
        z <- clusterEvalQ(
            cl,
            {
                library(dotenv)
                googledrive::drive_auth(Sys.getenv("GOOGLE_EMAIL"))
            }
        )
        cli::cli_progress_done()
    }

    pbapply::pboptions(type = "timer")
    cli::cli_alert("Downloading dictionaries ...")

    new_files <- googledrive::drive_ls(file.path(Sys.getenv("GOOGLE_PATH"), "NEW"))
    if (nrow(new_files) == 0L) {
        cli::cli_abort("No new files to process")
        return()
    }

    if (!is.null(cl)) clusterExport(cl, "new_files")
    z <- pbapply::pblapply(
        seq_len(nrow(new_files)),
        \(i) {
            new_path <- file.path(new_dir, new_files$name[i])
            if (!file.exists(new_path)) {
                googledrive::drive_download(
                    new_files$id[i],
                    path = new_path
                )
            }
        },
        cl = cl
    )
    new_files <- list.files(new_dir, full.names = TRUE)
    cli::cli_alert_success("Dictionaries downloaded")

    cli::cli_progress_step("Classifying files")
    # classify each files as either a data dictionary or variable list
    file_class <- vapply(new_files, classify_file, character(1L))

    dd_files <- new_files[file_class == "dd"]
    vl_files <- new_files[file_class == "vl"]
    bad_files <- new_files[file_class == "unknown"]

    if (length(dd_files)) {
        cli::cli_progress_step("Processing data dictionaries")
        print(dd_files)
        lapply(dd_files, process_dd, dd_dir)
    }

    if (length(vl_files)) {
        cli::cli_progress_step("Processing variable lists")
        lapply(vl_files, process_vl, vl_dir)
    }

    if (length(bad_files)) {
        cli::cli_progress_step("Moving bad files")
        lapply(bad_files, \(x) {
            file.rename(
                file.path(new_dir, x),
                file.path(bad_dir, x)
            )
        })
    }
}

classify_file <- function(file_name) {
    sheets <- readxl::excel_sheets(file_name)
    if ("Index" %in% sheets) {
        return("dd")
    }
    if (any(grepl("varlist", tolower(file_name)))) {
        return("vl")
    }
    return("unknown")
}

process_dd <- function(file, dd_dir) {
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
        ) |> suppressWarnings()
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

    collection <- tibble(
        collection_schema = schema[2],
        collection_name = col,
        database_id = stringr::str_trim(tolower(schema[1])),
        description = x[[2]][grep("Introduction", x$Index)],
        keywords = paste(stringr::str_to_title(keywords),
            sep = "; "
        )
    )

    tables <- tables |>
        mutate(
            collection_name = col,
            dataset_id =
                gsub("\\[|\\]", "", tables$idi.table.name),
            dd_order = seq_len(n())
        )
    codes <- codes

    DIR <- file.path(dd_dir, tools::file_path_sans_ext(basename(file)))
    if (!dir.exists(DIR)) dir.create(DIR)
    readr::write_csv(collection, file.path(DIR, "collection.csv"))
    readr::write_csv(tables, file.path(DIR, "tables.csv"))
    if (!is.null(codes)) {
        readr::write_csv(codes, file.path(DIR, "codes.csv"))
    }
}

process_vl <- function(file, vl_dir) {
    sheets <- readxl::excel_sheets(file)
    refresh_lists <- stringr::str_match(sheets, "varlist(Adhoc)?([0-9]+)?")
    refresh_lists[, 1] <- sheets

    apply(
        refresh_lists, 1L,
        \(x) {
            z <- readxl::read_excel(file, sheet = x[1])
            fname <- paste0(
                ifelse(is.na(x[2]), "refresh", "adhoc"),
                ".csv"
            )
            date <- substr(x[3], 1L, 6L)
            dir <- file.path(vl_dir, date)
            if (!dir.exists(dir)) dir.create(dir)
            readr::write_csv(z, file.path(dir, fname))
        }
    )
}
