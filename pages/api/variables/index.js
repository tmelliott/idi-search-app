import getVariables from "../../../components/database/variables"

export default async function variablesAPI(req, res) {
  const { q, datasetId, page, size } = req.query
  console.log(req.query)
  const variables = await getVariables(q, datasetId, page, size)
  res.status(200).json(variables)
}
