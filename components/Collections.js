import Link from "next/link"

function Collections({ collections }) {
  return (
    <section>
      <h2>Collections ({collections.length})</h2>
      <ul>
        {collections.map((collection) => (
          <li key={collection.collection_id}>
            <Link
              href={{
                pathname: "/collections/[collection_id]",
                query: { collection_id: collection.collection_id },
              }}
            >
              <a>{collection.collection_name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Collections
