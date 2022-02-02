import getVariables from "../../../components/database/variables"

export default async function variablesAPI(req, res) {
  const { q, datasetId } = req.query
  const variables = await getVariables(q, datasetId)
  const n = variables.length
  res.status(200).json({ vars: variables.slice(0, 1000), n: n })
}
