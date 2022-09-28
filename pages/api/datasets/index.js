import getDatasets from "../../../components/database/datasets"
export default async function datasetsAPI(req, res) {
  res.setHeader("Cache-Control", "s-maxage=604800")
  const { q, collectionId } = req.query
  const datasets = await getDatasets(q, collectionId)
  res.status(200).json(datasets)
}
