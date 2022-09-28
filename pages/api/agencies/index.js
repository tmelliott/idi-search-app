import getAgencies from "../../../components/database/agencies"

export default async function agenciesAPI(req, res) {
  res.setHeader("Cache-Control", "s-maxage=604800")
  const query = req.query.q
  const agencies = await getAgencies(query)
  res.status(200).json(agencies)
}
