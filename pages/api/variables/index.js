import getVariables from "../../../components/database/variables"

export default async function variablesAPI(req, res) {
  const { q, datasetId } = req.query
  const variables = await getVariables(q, datasetId)
  res.status(200).json(variables)
}
