import getVariables from "../../../components/database/variables"

export default async function variablesAPI(req, res) {
  res.setHeader("Cache-Control", "s-maxage=604800")
  const { q, include, datasetId, page, size, exact, description } = req.query
  const variables = await getVariables(
    q,
    include,
    datasetId,
    page,
    size,
    exact === "true",
    description
  )
  res.status(200).json(variables)
}
