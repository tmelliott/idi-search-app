import getCollections from "../../../components/database/collections"

export default async function collectionsAPI(req, res) {
  const query = req.query.q
  const collections = getCollections(query)
  res.status(200).json(collections)
}
