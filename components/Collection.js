import { CogIcon } from "@heroicons/react/outline"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import Agency from "./Agency"
import Datasets from "./Datasets"
import useCollection from "./hooks/useCollection"

function Collection({ id, action, highlight }) {
  const { collection, isLoading } = useCollection(id)

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />

  let description = collection.description
  if (highlight) {
    description = description.replace(/(police)/gi, "<mark>$1</mark>")
  }

  return (
    <div className="prose">
      <h2>{collection.collection_name} (Collection)</h2>
      <div className="text-xs">
        Agency:{` `}
        <span
          className="underline cursor-pointer"
          onClick={() =>
            action(<Agency id={collection.agency.agency_id} action={action} />)
          }
        >
          {collection.agency.agency_name}
        </span>
      </div>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown>
      <Datasets
        datasets={collection.datasets}
        action={action}
        title="Datasets in this collection"
      />
    </div>
  )
}

export default Collection
