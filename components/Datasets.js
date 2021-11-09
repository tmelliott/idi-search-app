import { EyeIcon } from "@heroicons/react/outline"
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
        <div className="">
          <div className="text-sm">
            <table className="divide-y divide-gray-200">
              <thead className="">
                <tr>
                  <th scope="col" className="text-left px-2 py-1">
                    Agency
                  </th>
                  <th className="text-left px-2 py-1">Dataset Name</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results?.slice(0, limit).map((dataset) => (
                  <tr
                    key={dataset.dataset_id}
                    className=" cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-2 py-1 whitespace-nowrap">
                      {dataset.collection.agency.agency_name}
                    </td>
                    <td
                      className="px-2 py-1 whitespace-nowrap"
                      onClick={() => showDataset(dataset.dataset_id)}
                    >
                      {dataset.dataset_name}
                    </td>
                  </tr>
                ))}
                {results && results.length > limit && limit > -1 && (
                  <tr className="cursor-pointer hover:bg-gray-50 text-xs">
                    <td
                      colSpan="2"
                      className="px-2 py-1 text-right"
                      onClick={showDatasets}
                    >
                      <em>and {results.length - limit} more ...</em>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

export default Datasets
