import Link from "next/link"
import { CogIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import Datasets from "./Datasets"
import useCollection from "./hooks/useCollection"

function Collection({ id, term }) {
  const router = useRouter()
  const { collection, isLoading } = useCollection(id)

  const [highlight, setHighlight] = useState("")

  useEffect(() => {
    setHighlight(router.query.s || "")
  }, [router.query])

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />

  let description = collection.description || ""
  if (highlight) {
    const searchMask = `(${highlight.replaceAll(" ", "|")})`
    const regEx = new RegExp(searchMask, "ig")
    const replaceMask = "<mark>$1</mark>"
    description = description.replace(regEx, replaceMask)
  }

  return (
    <div className="prose">
      <Link href={`/collections/${collection.collection_id}`}>
        <h2 className="underline cursor-pointer">
          {collection.collection_name} (Collection)
        </h2>
      </Link>
      <div className="text-xs">
        Agency:{` `}
        <Link href={`/agencies/${collection.agency.agency_id}`}>
          <a className="underline cursor-pointer">
            {collection.agency.agency_name}
          </a>
        </Link>
      </div>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown>
      <Datasets
        term={term}
        collectionId={id}
        title="Datasets in this collection"
      />
    </div>
  )
}

export default Collection
