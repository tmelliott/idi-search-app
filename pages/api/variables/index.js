import getVariables from "../../../components/database/variables"

export default async function variablesAPI(req, res) {
  const query = req.query.q
  const variables = await getVariables(query)
  res.status(200).json(variables)
}
