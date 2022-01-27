import { useRouter } from "next/router"
import Dataset from "./Dataset"
import useDatasets from "./hooks/useDatasets"
import Loading from "./Loading"

function Datasets({ term, collectionId, limit, title = "Datasets" }) {
  const router = useRouter()
  const { datasets, isLoading } = useDatasets(term, collectionId)

  const showDataset = (id) => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "dataset",
          id: id,
        },
      },
      undefined,
      { shallow: true }
    )
  }
  const showDatasets = () => {
    router.push("/datasets")
  }
  if (!limit) limit = datasets?.length

  return (
    <section>
      <h3>
        {title} ({isLoading ? <Loading /> : datasets?.length})
      </h3>{" "}
      {datasets?.length > 0 && (
        <div className="app-table">
          <table>
            {datasets[0].collection && (
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Collection</th>
                </tr>
              </thead>
            )}
            <tbody>
              {datasets?.slice(0, limit).map((dataset) => (
                <tr
                  key={dataset.dataset_id}
                  className="clickable"
                  onClick={() => showDataset(dataset.dataset_id)}
                >
                  <td className="flex flex-col">
                    <div>{dataset.dataset_name}</div>
                    <div className="text-xxs font-mono">
                      {dataset.dataset_id}
                    </div>
                  </td>
                  {dataset.collection && (
                    <td>
                      <div className="flex flex-col items-start">
                        <div>{dataset.dataset_name}</div>
                        <div className="text-xxs">
                          {dataset.collection.agency.agency_name}
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {datasets && datasets.length > limit && limit > -1 && (
                <tr className="clickable">
                  <td colSpan="2" onClick={showDatasets}>
                    <em>and {datasets.length - limit} more ...</em>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Datasets
