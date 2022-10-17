import { CogIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import Link from "next/link"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import useDataset from "./hooks/useDataset"
import Variables from "./Variables"

function Dataset({ id, term }) {
  const router = useRouter()
  const { dataset, isLoading, error } = useDataset(id)
  const [highlight, setHighlight] = useState("")

  useEffect(() => {
    setHighlight(router.query.s || "")
  }, [router.query])

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />
  if (error) return <>Error ...</>

  console.log(dataset)

  let description = dataset.description || ""
  if (highlight) {
    const searchMask = `(${highlight.replaceAll(" ", "|")})`
    const regEx = new RegExp(searchMask, "ig")
    const replaceMask = "<mark>$1</mark>"
    description = description.replace(regEx, replaceMask)
  }

  const linkingVars = dataset.variables.filter((v) =>
    v.variable_id.includes("uid")
  )

  return (
    <div className="prose">
      <Link href={`/datasets/${dataset.dataset_id}`}>
        <h2 className="underline cursor-pointer">
          {dataset.dataset_name} (Dataset)
        </h2>
      </Link>
      {dataset.collection && (
        <div className="text-xs">
          In collection:{` `}
          <Link href={`/collections/${dataset.collection.collection_id}`}>
            <a className="underline cursor-pointer">
              {dataset.collection.collection_name}
            </a>
          </Link>
        </div>
      )}
      {dataset.collection && dataset.collection.agency && (
        <div className="text-xs">
          Data Supply Agency:{` `}
          <Link href={`/agencies/${dataset.collection.agency.agency_id}`}>
            <a className="underline cursor-pointer">
              {dataset.collection.agency.agency_name}
            </a>
          </Link>
        </div>
      )}
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown>

      {linkingVars.length > 0 && (
        <div>
          <h4>Linking variables</h4>
          <p>These variables can be used to link to other datasets.</p>
          <ul>
            {linkingVars.map((v) => (
              <Link
                key={v.variable_id}
                href={`/variables?s=${v.variable_id}&v=dataset&id=${dataset.dataset_id}`}
              >
                <li className="cursor-pointer">{v.variable_id}</li>
              </Link>
            ))}
          </ul>
        </div>
      )}

      {dataset.matches.length > 0 && (
        <div>
          <h4>Alternative names</h4>
          <p>
            These are other datasets the may be the same, with a different name.
          </p>
          <ul>
            {dataset.matches.map((d) => (
              <Link
                key={d.dataset_id}
                href={`/datasets/${dataset.dataset_id}?v=dataset&id=${d.dataset_id}`}
              >
                <li className="cursor-pointer">
                  {d.dataset_name || d.dataset_id}
                </li>
              </Link>
            ))}
          </ul>
        </div>
      )}

      <Variables
        term={term}
        datasetId={dataset.dataset_id}
        title="Variables in this dataset"
        paginate={5}
      />
    </div>
  )
}

export default Dataset
