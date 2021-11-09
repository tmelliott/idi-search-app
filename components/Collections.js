import { useRouter } from "next/router"
import Collection from "./Collection"
import useCollections from "./hooks/useCollections"
import Loading from "./Loading"

function Collections({
  collections,
  action,
  term,
  limit,
  title = "Collections",
}) {
  const router = useRouter()
  const { collections: results, isLoading } = term
    ? useCollections(term)
    : {
        collections: collections,
        isLoading: false,
      }
  const showCollection = (id) => {
    action(<Collection id={id} action={action} />)
  }
  const showCollections = () => {
    router.push("/collections")
  }
  if (results && !limit) limit = results.length
  return (
    <section>
      <h3>
        {title} ({isLoading ? <Loading /> : results.length})
      </h3>

      {!isLoading && (
        <div className="app-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Agency</th>
              </tr>
            </thead>
            <tbody>
              {results?.slice(0, limit).map((row) => (
                <tr
                  key={row.collection_id}
                  onClick={() => showCollection(row.collection_id)}
                >
                  <td>{row.collection_name}</td>
                  <td>{row.agency.agency_name}</td>
                </tr>
              ))}
              {results && results.length > limit && limit > -1 && (
                <tr className="clickable">
                  <td
                    colSpan={2}
                    onClick={showCollections}
                    className="text-right"
                  >
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

export default Collections
