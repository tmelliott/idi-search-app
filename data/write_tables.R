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



    agencies <- readr::read_csv('data/out/agencies.csv')
    dbExecute(con, "DELETE FROM agencies;")
    ok <- pbsapply(seq_len(nrow(agencies)), function(i)
        dbExecute(con,
            sprintf("INSERT INTO agencies VALUES ('%s', '%s');",
                agencies$agency_id[i], agencies$agency_name[i]
            )
        )
    )

    nastr <- function(x) ifelse(is.na(x), "", x)

    collections <- readr::read_csv('data/out/collections.csv')
    dbExecute(con, "DELETE FROM collections;")
    ok <- pbsapply(seq_len(nrow(collections)), function(i)
        dbExecute(con,
            sprintf("INSERT INTO collections VALUES (\"%s\", \"%s\", \"%s\", \"%s\", \"%s\");",
                collections$collection_id[i],
                nastr(collections$collection_name[i]),
                nastr(collections$agency_id[i]),
                nastr(collections$database_id[i]),
                nastr(collections$description[i])
            )
        )
    )

}
