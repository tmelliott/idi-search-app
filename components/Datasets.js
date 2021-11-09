import Dataset from "./Dataset"
import useDatasets from "./hooks/useDatasets"
import Loading from "./Loading"

function Datasets({ datasets, action, term, limit, title = "Datasets" }) {
  const { datasets: results, isLoading } = term
    ? useDatasets(term)
    : {
        datasets: datasets,
        isLoading: false,
      }

  const showDataset = (id) => {
    action(<Dataset id={id} action={action} />)
  }
  const showDatasets = () => {
    action(<Datasets datasets={datasets} action={action} term={term} />)
  }
  if (!limit) limit = results.length

  return (
    <section>
      <h3>
        {title} ({isLoading ? <Loading /> : results.length})
      </h3>{" "}
      {!isLoading && (
        <div className="app-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Agency</th>
              </tr>
            </thead>
            <tbody>
              {results?.slice(0, limit).map((dataset) => (
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
                  <td>
                    <div className="flex flex-col items-start">
                      <div>{dataset.dataset_name}</div>
                      <div className="text-xxs">
                        {dataset.collection.agency.agency_name}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {results && results.length > limit && limit > -1 && (
                <tr className="clickable">
                  <td colSpan="2" onClick={showDatasets}>
                    <em>and {results.length - limit} more ...</em>
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
