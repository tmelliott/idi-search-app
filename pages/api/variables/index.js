import getVariables from "../../../components/database/variables"

export default async function variablesAPI(req, res) {
  const { q, include, datasetId, page, size } = req.query
  const variables = await getVariables(q, include, datasetId, page, size)
  res.status(200).json(variables)
}
