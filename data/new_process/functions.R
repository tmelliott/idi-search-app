connect_gdrive <- function() {
    options(
        googledrive_quiet = TRUE
    )

    cli::cli_progress_step("Authenticating with Google Drive")
    googledrive::drive_auth(Sys.getenv("GOOGLE_EMAIL"))
}
