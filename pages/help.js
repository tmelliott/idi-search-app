function help() {
  return (
    <div>
      <h1>User Guide</h1>

      <h2>Searching IDI variables</h2>
      <p>
        Use the search box to look for variables in the IDI. There are two
        databases: IDI refreshes containing routinely cleaned data, and Adhoc
        containing additional datasets. You can switch between searching these
        two databases using the drop down on the right hand side of the search.
      </p>
      <p>
        To search for multiple terms, use commas for OR search, and plus for AND
        search.
      </p>
      <p>
        For example, searching "sex, gender" will show variables matching "sex"
        OR "gender". Searching for "income + tax" will show variables matching
        both "income" AND "tax".
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
