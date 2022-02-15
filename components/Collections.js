import { useRouter } from "next/router"
import Link from "next/link"
import useCollections from "./hooks/useCollections"
import Loading from "./Loading"
import PagedTable from "./PagedTable"
import { LinkIcon } from "@heroicons/react/outline"

function Collections({ term, agencyId, limit, title = "Collections" }) {
  const router = useRouter()
  const { collections, isLoading } = useCollections(term, agencyId)

  const showCollection = (collection) => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "collection",
          id: collection.collection_id,
        },
      },
      undefined,
      { shallow: true }
    )
  }
  if (!limit) limit = collections?.length

  const tblCols = [
    {
      name: "collection_name",
      label: "Collection",
    },
    { name: "agency_name", label: "Agency" },
  ]

  return (
    <section>
      <h3>
        {router.asPath === "/collections" ? (
          <>Collections ({isLoading ? <Loading /> : collections.length})</>
        ) : (
          <Link href="/collections">
            <a className="flex flex-row items-center gap-2 group">
              Collections ({isLoading ? <Loading /> : collections.length})
              <LinkIcon
                height={15}
                className="inline text-blue-600 opacity-0 group-hover:opacity-100"
              />
            </a>
          </Link>
        )}
      </h3>

      {collections?.length > 0 && (
        <PagedTable
          cols={tblCols}
          rows={collections.map((c) => ({
            ...c,
            agency_name: c.agency.agency_name,
            id: c.collection_id,
          }))}
          n={limit}
          rowHandler={showCollection}
        />
      )}
    </section>
  )
}

export default Collections
