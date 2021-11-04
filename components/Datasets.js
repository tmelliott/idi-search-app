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
      <ul>
        {results?.slice(0, limit).map((dataset) => (
          <li key={dataset.dataset_id}>
            <span
              className="cursor-pointer"
              onClick={() => showDataset(dataset.dataset_id)}
            >
              {dataset.dataset_name}
            </span>
          </li>
        ))}
        {results && results.length > limit && limit > -1 && (
          <li>
            <span className="cursor-pointer" onClick={showDatasets}>
              <em>and {results.length - limit} more ...</em>
            </span>
          </li>
        )}
      </ul>
    </section>
  )
}

export default Datasets
