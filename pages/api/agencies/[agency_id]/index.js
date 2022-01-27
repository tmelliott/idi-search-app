import getAgency from "../../../../components/database/agency"

export default async function agencyAPI(req, res) {
  const { agency_id, q } = req.query
  const agency = await getAgency(agency_id, q)
  res.status(200).json(agency)
}
