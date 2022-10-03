import getCollections from "../../../components/database/collections"

export default async function collectionsAPI(req, res) {
  res.setHeader("Cache-Control", "s-maxage=604800")
  const { q, agencyId } = req.query
  const collections = await getCollections(q, agencyId)
  res.status(200).json(collections)
}
