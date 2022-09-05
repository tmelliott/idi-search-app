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

        agencies <- readr::read_csv('data/out/agencies.csv')
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

        collections <- readr::read_csv('data/out/collections.csv')
        dbExecute(con, "DELETE FROM collections;")
        dbExecute(
            con,
            glue::glue_sql(
                "INSERT INTO collections VALUES ",
                glue::glue_sql_collapse(
                    with(collections,
                        glue::glue_sql("({collection_id}, {agency_id}, {agency_id}, {database_id}, {description})", .con = con)
                    ),
                    ", "
                )
            )
        )

        datasets <- readr::read_csv('data/out/datasets.csv')
        dbExecute(con, "DELETE FROM datasets;")
        dbExecute(
            con,
            paste(
                "INSERT INTO datasets VALUES",
                glue::glue_sql_collapse(
                    with(datasets,
                        glue::glue_sql("({dataset_id}, {dataset_name}, {collection_id}, {description}, {reference_period})", .con = con)
                    ),
                    ", "
                )
            )
        )

        variables <- readr::read_csv('data/out/variables.csv')
        dbExecute(con, "DELETE FROM variables;")
        dbExecute(
            con,
            paste(
                "INSERT INTO variables VALUES",
                glue::glue_sql_collapse(
                    with(variables,
                        glue::glue_sql("({variable_id}, {variable_name}, {dataset_id}, {description}, {information}, {primary_key}, {type}, {size}, {refreshes})", .con = con)
                    ),
                    ", "
                )
            )
        )

    })


}
