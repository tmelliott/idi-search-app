import Collection from "./Collection"
import Loading from "./Loading"

function Collections({ collections, action, loading, title = "Collections" }) {
  const showCollection = (id) => {
    action(<Collection id={id} action={action} />)
  }
  return (
    <section>
      <h3>
        {title} ({loading ? <Loading /> : collections.length})
      </h3>
      <ul>
        {collections.map((collection) => (
          <li key={collection.collection_id}>
            <span
              className="cursor-pointer"
              onClick={() => showCollection(collection.collection_id, action)}
            >
              {collection.collection_name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Collections
