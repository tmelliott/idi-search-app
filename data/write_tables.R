library(RMySQL)
library(dbplyr)
library(pbapply)
library(cli)

write_tables <- function() {
    cli_h1("Writing tables to database")

    cli_progress_step("Connecting to database")
    con <- dbConnect(
        MySQL(),
        user = "root",
        host = "127.0.0.1",
        port = 3309,
        dbname = "idisearchapp"
    )
    cli_process_done()

    DBI::dbWithTransaction(con, {
        cli_h3("Agencies")
        cli_progress_step("Read")
        agencies <- readr::read_csv("data/out/agencies.csv",
            show_col_types = FALSE
        )
        cli_progress_step("Delete")
        dbExecute(con, "DELETE FROM agencies;")
        cli_progress_step("Write")
        dbExecute(
            con,
            glue::glue_sql(
                "INSERT INTO agencies VALUES ",
                glue::glue_sql_collapse(
                    glue::glue_sql("({agencies$agency_id}, {agencies$agency_name})", .con = con),
                    ", "
                )
            )
        )
        cli_progress_done()

        cli_h3("Collections")
        cli_progress_step("Read")
        collections <- readr::read_csv("data/out/collections.csv",
            show_col_types = FALSE
        )
        cli_progress_step("Delete")
        dbExecute(con, "DELETE FROM collections;")
        cli_progress_step("Write")
        dbExecute(
            con,
            glue::glue_sql(
                "INSERT INTO collections VALUES ",
                glue::glue_sql_collapse(
                    with(
                        collections,
                        glue::glue_sql("({collection_id}, {collection_name}, {agency_id}, {database_id}, {description})", .con = con)
                    ),
                    ", "
                )
            )
        )
        cli_progress_done()

        cli_h3("Datasets")
        cli_progress_step("Read")
        datasets <- readr::read_csv("data/out/datasets.csv",
            show_col_types = FALSE
        )
        cli_progress_step("Delete")
        dbExecute(con, "DELETE FROM datasets;")
        cli_progress_step("Write")
        dbExecute(
            con,
            paste(
                "INSERT INTO datasets (dataset_id, dataset_name, collection_id, dd_order, description, reference_period)",
                "VALUES",
                glue::glue_sql_collapse(
                    with(
                        datasets,
                        glue::glue_sql("({dataset_id}, {dataset_name}, {collection_id}, {dd_order}, {description}, {reference_period})", .con = con)
                    ),
                    ", "
                )
            )
        )
        cli_progress_done()
    })

    ## TODO: refactor this to use UPDATE, INSERT, and DELETE instad of DELETE + INSERT
    ## (for better maintenance downtime)

    cli_h3("Variables")
    cli_progress_step("Read")
    variables <- readr::read_csv("data/out/variables.csv",
        show_col_types = FALSE
    )
    cli_progress_step("Delete")
    dbExecute(con, "DELETE FROM variables;")
    n <- 5000
    N <- ceiling(nrow(variables) / n)
    cli_progress_bar("Write", total = N)
    for (i in 1:N) {
        ii <- 1:n + n * (i - 1)
        ii <- ii[ii <= nrow(variables)]
        dbExecute(
            con,
            paste(
                "INSERT INTO variables (variable_id, variable_name, dataset_id, dd_order, description, information, primary_key, type, size, refreshes)",
                "VALUES",
                glue::glue_sql_collapse(
                    with(
                        variables[ii, ],
                        glue::glue_sql("({variable_id}, {variable_name}, {dataset_id}, {dd_order}, {description}, {information}, {primary_key}, {type}, {size}, {refreshes})", .con = con)
                    ),
                    ", "
                )
            )
        )
        cli_progress_update()
    }
    cli_progress_done()


    DBI::dbWithTransaction(con, {
        cli_h3("Table matches")
        cli_progress_step("Read")
        table_matches <- readr::read_csv("data/out/table_matches.csv",
            show_col_types = FALSE
        )
        cli_progress_step("Delete")
        dbExecute(con, "DELETE FROM table_matches;")
        cli_progress_step("Write")
        dbExecute(
            con,
            paste(
                "INSERT INTO table_matches VALUES",
                glue::glue_sql_collapse(
                    with(
                        table_matches,
                        glue::glue_sql("({table_id}, {alt_table_id}, {notes})", .con = con)
                    ),
                    ", "
                )
            )
        )
        cli_progress_done()

        cli_h3("Variable matches")
        cli_progress_step("Read")
        variable_matches <- readr::read_csv("data/out/variable_matches.csv",
            show_col_types = FALSE
        )
        cli_progress_step("Delete")
        dbExecute(con, "DELETE FROM variable_matches;")
        cli_progress_step("Write")
        dbExecute(
            con,
            paste(
                "INSERT INTO variable_matches VALUES",
                glue::glue_sql_collapse(
                    with(
                        variable_matches,
                        glue::glue_sql("({table_id}, {variable_id}, {alt_variable_id}, {notes})", .con = con)
                    ),
                    ", "
                )
            )
        )
        cli_progress_done()

        cli_h3("Table regex")
        cli_progress_step("Read")
        dataset_regex <- readr::read_csv("data/out/datasets_regex.csv",
            show_col_types = FALSE
        )
        cli_progress_step("Delete")
        dbExecute(con, "DELETE FROM datasets_regex;")
        cli_progress_step("Write")
        dbExecute(
            con,
            paste(
                "INSERT INTO datasets_regex VALUES",
                glue::glue_sql_collapse(
                    with(
                        dataset_regex,
                        glue::glue_sql("({dataset_id}, {dataset_id_regex})", .con = con)
                    ),
                    ", "
                )
            )
        )
        cli_progress_done()
    })

    cli_h3("Code values")
    cli_progress_step("Read")
    code_values <- readr::read_csv("data/out/code_values.csv",
        show_col_types = FALSE
    )
    cli_progress_step("Delete")
    dbExecute(con, "DELETE FROM code_values;")
    # dbExecute(con, "ALTER TABLE code_values AUTO_INCREMENT = 1;")
    n <- 5000
    N <- ceiling(nrow(code_values) / n)
    cli_progress_bar("Write", total = N)
    for (i in 1:N) {
        ii <- 1:n + n * (i - 1)
        ii <- ii[ii <= nrow(code_values)]
        dbExecute(
            con,
            paste(
                "INSERT INTO code_values (variable_id, code, label) VALUES ",
                glue::glue_sql_collapse(
                    with(
                        code_values[ii, ],
                        glue::glue_sql("({variable_id}, {code}, {label})", .con = con)
                    ),
                    ", "
                )
            )
        )
        cli_progress_update()
    }
    cli_progress_done()

    cli_h3("DB info")
    # figure out latest refresh
    cli_progress_step("Fetching info")
    vs <- unique(do.call(c, strsplit(variables$refreshes, ",")))
    vs <- suppressWarnings(as.integer(substr(vs, 1, 6)))
    vs <- vs[!is.na(vs)]
    db_date <- format(as.Date(as.character(max(vs)), "%Y%M"), "%B %Y")

    ## insert or update db info
    cli_progress_step("Write")
    dbExecute(
        con,
        paste(
            "INSERT INTO db_info (id, db_updated, db_refresh)",
            glue::glue_sql("VALUES (1, NOW(), {db_date})", .con = con),
            "ON DUPLICATE KEY UPDATE db_updated = VALUES(db_updated), db_refresh = VALUES(db_refresh)"
        )
    )
    cli_progress_done()

    cli_rule()
}

write_tables()
