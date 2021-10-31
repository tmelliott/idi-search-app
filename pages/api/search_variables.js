import content from "../../data/idi.json"

export default function variableAPI(req, res) {
  let results = [...content]

  if (!req.query.search) {
    res.status(400).end("No search location specified")
    return
  }
  const search = req.query.search

  if (req.query.term) {
    const term = req.query.term.toLowerCase()
    results = results.filter((variable) => {
      if (
        search.includes("table") &&
        variable.table_name.toLowerCase().includes(term)
      )
        return true
      if (
        search.includes("variable") &&
        variable.variable_name.toLowerCase().includes(term)
      )
        return true
      // if (
      //   search.includes("description") &&
      //   variable.description.includes(term)
      // )
      //   return true
    })
  }
  if (req.query.agency) {
    results = results.filter((variable) => variable.agency === req.query.agency)
  }

  results = results.map((variable) => ({
    id: variable.id,
    agency: variable.agency,
    table: variable.table_name,
    variable: variable.variable_name,
  }))

  res.status(200).json(results)
}
