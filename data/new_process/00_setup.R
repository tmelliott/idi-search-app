source("functions.R")

setup_dirs <- function(..., baseDir = Sys.getenv("GOOGLE_PATH")) {
    dirs <- list(...)
    if (length(dirs) == 0) {
        return()
    }

    connect_gdrive()

    # list directories in drive
    dx <- googledrive::drive_ls(file.path(baseDir))

    for (d in dirs) {
        if (!d$name %in% dx$name) {
            cli::cli_progress_step(
                "Creating directory {d$name}"
            )
            dn <- googledrive::drive_mkdir(d$name, path = baseDir)
            googledrive::drive_share(
                dn$id,
                role = d$permission,
                type = "anyone"
            )
        }
    }
    cli::cli_progress_done()
}

setup_dirs(
    new = list(name = "New Files - Upload here", permission = "writer"),
    bad = list(name = "Bad Files - rejected", permission = "reader"),
    meta = list(name = "Metadata", permission = "reader"),
    prod = list(name = "Production CSVs", permission = "reader")
)

setup_dirs(
    dd = list(name = "Data dictionaries", permission = "reader"),
    vl = list(name = "Variable lists", permission = "reader"),
    manual = list(name = "Manual", permission = "writer"),
    baseDir = file.path(Sys.getenv("GOOGLE_PATH"), "Metadata")
)

setup_dirs(
    collections = list(name = "Collections", permission = "reader"),
    datasets = list(name = "Datasets", permission = "reader"),
    variables = list(name = "Variables", permission = "reader"),
    raw = list(name = "Raw files", permission = "reader"),
    baseDir = file.path(
        Sys.getenv("GOOGLE_PATH"), "Metadata", "Data dictionaries"
    )
)

setup_dirs(
    raw = list(name = "Raw files", permission = "reader"),
    baseDir = file.path(
        Sys.getenv("GOOGLE_PATH"), "Metadata", "Variable lists"
    )
)
