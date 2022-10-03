library(RMySQL)
library(dbplyr)
library(pbapply)

write_tables <- function() {
    con <- dbConnect(
        MySQL(),
        user = "root",
        host = "127.0.0.1",
        port = 3309,
        dbname = "idisearchapp"
    )

    DBI::dbWithTransaction(con, {
        agencies <- readr::read_csv("data/out/agencies.csv")
        dbExecute(con, "DELETE FROM agencies;")
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

        collections <- readr::read_csv("data/out/collections.csv")
        dbExecute(con, "DELETE FROM collections;")
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

        datasets <- readr::read_csv("data/out/datasets.csv")
        dbExecute(con, "DELETE FROM datasets;")
        dbExecute(
            con,
            paste(
                "INSERT INTO datasets VALUES",
                glue::glue_sql_collapse(
                    with(
                        datasets,
                        glue::glue_sql("({dataset_id}, {dataset_name}, {collection_id}, {description}, {reference_period})", .con = con)
                    ),
                    ", "
                )
            )
        )
    })

    ## TODO: refactor this to use UPDATE, INSERT, and DELETE instad of DELETE + INSERT
    ## (for better maintenance downtime)

    variables <- readr::read_csv("data/out/variables.csv")
    dbExecute(con, "DELETE FROM variables;")
    # n <- 10000
    # N <- ceiling(nrow(variables) / N)
    # pb <- txtProgressBar(max = N, style = 3L)
    # for (i in 1:N) {
    #     setTxtProgressBar(pb, i)
    #     ii <- 1:N + N * (i - 1)
    #     ii <- ii[ii <= nrow(variables)]
    dbExecute(
        con,
        paste(
            "INSERT INTO variables VALUES",
            glue::glue_sql_collapse(
                with(
                    variables,
                    glue::glue_sql("({variable_id}, {variable_name}, {dataset_id}, {description}, {information}, {primary_key}, {type}, {size}, {refreshes})", .con = con)
                ),
                ", "
            )
        )
    )
    # }
    # close(pb)


    DBI::dbWithTransaction(con, {
        table_matches <- readr::read_csv("data/out/table_matches.csv")
        dbExecute(con, "DELETE FROM table_matches;")
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

        variable_matches <- readr::read_csv("data/out/variable_matches.csv")
        dbExecute(con, "DELETE FROM variable_matches;")
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
    })
}

write_tables()
