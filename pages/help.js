import Head from "next/head"

function help() {
  return (
    <div>
      <Head>
        <title>Help | What's in the IDI?</title>
      </Head>

      <h1>User Guide</h1>

      <h2>Searching IDI variables</h2>
      <p>
        Use the search box to look for variables in the IDI. This will list all
        agencies, collections, datasets, or variables containing the term in any
        of the information associated with it.
      </p>
      {/* <p>
        To search for multiple terms, use commas for OR search, and plus for AND
        search.
      </p>
      <p>
        For example, searching "sex, gender" will show variables matching "sex"
        OR "gender". Searching for "income + tax" will show variables matching
        both "income" AND "tax".
      </p> */}

      <h2>Exploring variables</h2>
      <p>
        Click on rows in the table to view additional information about each
        variable, including the schema and table names required for SQL queries.
      </p>
    </div>
  )
}

export default help
