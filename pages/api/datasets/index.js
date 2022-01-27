import getDatasets from "../../../components/database/datasets"
export default async function datasetsAPI(req, res) {
  const { q, collectionId } = req.query
  const datasets = await getDatasets(q, collectionId)
  res.status(200).json(datasets)
}
