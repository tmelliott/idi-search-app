import Head from "next/head"

function help() {
  return (
    <div className="prose prose-sm mx-auto">
      <Head>
        <title>Help | IDI Search</title>
      </Head>

      <h1>User Guide</h1>

      <h2>Searching IDI variables</h2>
      <p>
        Use the search box to look for variables in the IDI. This will list all
        agencies, collections, datasets, or variables containing the term in any
        of the information associated with it.
      </p>
      <p>
        Currently, the search only does 'AND' search by simply separating search
        terms with spaces. For example, "social housing" will find results that
        match both "social" and "housing".
      </p>

      <h2>Exploring variables</h2>
      <p>
        Click on rows in the table to view additional information about each
        variable, including the schema and table names required for SQL queries.
      </p>
    </div>
  )
}

export default help
