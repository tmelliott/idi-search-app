import getAgencies from "../../../components/database/agencies"

export default async function agenciesAPI(req, res) {
  const query = req.query.q
  const agencies = await getAgencies(query)
  res.status(200).json(agencies)
}
