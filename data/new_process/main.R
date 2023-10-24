cli::cli_h1("Building IDI Search Database")

source("functions.R")

if (getRversion() < numeric_version("4.1.0")) {
    stop("Script required R >= 4.1.0.")
}

if (Sys.getenv("GOOGLE_EMAIL") == "") {
    library(dotenv)
}
if (Sys.getenv("GOOGLE_EMAIL") == "") {
    stop("Please set GOOGLE_EMAIL in .env file.")
}

# 1. process NEW data files
cli::cli_h2("Processing new files")
source("01_process.R")
process_new_files()
