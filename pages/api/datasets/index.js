import getDatasets from "../../../components/database/datasets"
export default async function datasetsAPI(req, res) {
  const query = req.query.q
  const datasets = getDatasets()
  datasets
}
