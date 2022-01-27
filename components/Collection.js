import Link from "next/link"
import { CogIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import Agency from "./Agency"
import Datasets from "./Datasets"
import useCollection from "./hooks/useCollection"

function Collection({ id }) {
  const router = useRouter()
  const { collection, isLoading } = useCollection(id)

  const [highlight, setHighlight] = useState("")

  useEffect(() => {
    setHighlight(router.query.s || "")
  }, [router.query])

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />

  let description = collection.description
  if (highlight) {
    const searchMask = `(${highlight})`
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
        <span
          className="underline cursor-pointer"
          onClick={() =>
            router.push({
              pathname: router.pathname,
              query: {
                ...router.query,
                v: "agency",
                id: collection.agency.agency_id,
              },
            })
          }
        >
          {collection.agency.agency_name}
        </span>
      </div>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown>
      {/* <Datasets
        items={collection.datasets}
        action={action}
        title="Datasets in this collection"
      /> */}
    </div>
  )
}

export default Collection
