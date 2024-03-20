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

# init drive, if needed
cli::cli_h2("Initializing")
source("00_setup.R")

# 1. process NEW data files
cli::cli_h2("Processing new files")
source("01_process.R")

# 2. extract metadata
cli::cli_h2("Extracting metadata")
source("02_extract_metadata.R")
