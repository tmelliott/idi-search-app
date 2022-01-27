import Link from "next/link"
import { useRouter } from "next/router"
import Collection from "./Collection"
import useCollections from "./hooks/useCollections"
import Loading from "./Loading"

function Collections({ items, term, limit, title = "Collections" }) {
  const router = useRouter()
  const { collections, isLoading } = useCollections(term, items)

  console.log(term)

  const showCollection = (id) => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "collection",
          id: id,
        },
      },
      undefined,
      { shallow: true }
    )
  }
  const showCollections = () => {
    router.push("/collections")
  }
  if (!limit) limit = collections?.length

  return (
    <section>
      <h3>
        {title} ({isLoading ? <Loading /> : collections?.length})
      </h3>

      {collections?.length > 0 && (
        <div className="app-table">
          <table>
            {collections[0].agency && (
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Agency</th>
                </tr>
              </thead>
            )}
            <tbody>
              {collections?.slice(0, limit).map((row) => {
                return (
                  <tr
                    key={row.collection_id}
                    className="clickable"
                    onClick={() => showCollection(row.collection_id)}
                  >
                    <td>{row.collection_name}</td>
                    {row.agency && <td>{row.agency.agency_name}</td>}
                  </tr>
                )
              })}
              {collections && collections.length > limit && limit > -1 && (
                <tr className="clickable">
                  <td
                    colSpan={2}
                    onClick={showCollections}
                    className="text-right"
                  >
                    <em>and {collections.length - limit} more ...</em>
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

export default Collections
