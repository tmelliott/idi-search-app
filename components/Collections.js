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
    action(
      <Collections collections={collections} action={action} term={term} />
    )
  }
  if (!limit) limit = results.length
  return (
    <section>
      <h3>
        {title} ({isLoading ? <Loading /> : results.length})
      </h3>
      <ul>
        {results?.slice(0, limit).map((collection) => (
          <li key={collection.collection_id}>
            <span
              className="cursor-pointer"
              onClick={() => showCollection(collection.collection_id, action)}
            >
              {collection.collection_name}
            </span>
          </li>
        ))}
        {results && results.length > limit && limit > -1 && (
          <li>
            <span className="cursor-pointer" onClick={showCollections}>
              <em>and {results.length - limit} more ...</em>
            </span>
          </li>
        )}
      </ul>
    </section>
  )
}

export default Collections
