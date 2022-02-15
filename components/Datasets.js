import { useRouter } from "next/router"
import Link from "next/link"
import useDatasets from "./hooks/useDatasets"
import Loading from "./Loading"
import PagedTable from "./PagedTable"
import { LinkIcon } from "@heroicons/react/outline"

function Datasets({ term, collectionId, limit, title = "Datasets" }) {
  const router = useRouter()
  const { datasets, isLoading } = useDatasets(term, collectionId)

  const showDataset = (dataset) => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "dataset",
          id: dataset.dataset_id,
        },
      },
      undefined,
      { shallow: true }
    )
  }
  if (!limit) limit = datasets?.length

  const tblCols = [
    {
      name: "dataset_name",
      label: "Dataset",
      value: (r) => (
        <>
          <div>{r.dataset_name}</div>
          <div className="text-xxs font-mono">{r.dataset_id}</div>
        </>
      ),
    },
    {
      name: "collection_name",
      label: "Collection / Agency",
      value: (r) => {
        return r.collection ? (
          <>
            <div>{r.collection?.collection_name}</div>
            <div className="text-xxs">{r.collection?.agency.agency_name}</div>
          </>
        ) : (
          <div className="text-gray-400 italic text-xxs">Not available</div>
        )
      },
    },
  ]

  return (
    <section>
      <h3>
        {router.asPath === "/datasets" ? (
          <>Datasets ({isLoading ? <Loading /> : datasets.length})</>
        ) : (
          <Link href="/datasets">
            <a className="flex flex-row items-center gap-2 group">
              Datasets ({isLoading ? <Loading /> : datasets.length})
              <LinkIcon
                height={15}
                className="inline text-blue-600 opacity-0 group-hover:opacity-100"
              />
            </a>
          </Link>
        )}
      </h3>

      {datasets?.length > 0 && (
        <PagedTable
          cols={tblCols}
          rows={datasets.map((d) => ({
            ...d,
            collection_name: d.collection?.collection_name,
            id: d.dataset_id,
          }))}
          n={limit}
          rowHandler={showDataset}
        />
      )}
    </section>
  )
}

export default Datasets
