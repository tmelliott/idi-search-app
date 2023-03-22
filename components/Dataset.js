import {
  CogIcon,
  ExternalLinkIcon,
  InformationCircleIcon,
  SearchCircleIcon,
} from "@heroicons/react/outline"
import { useRouter } from "next/router"
import Link from "next/link"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import useDataset from "./hooks/useDataset"
import Variables from "./Variables"
import Loading from "./Loading"

function Dataset({ id, term }) {
  const router = useRouter()
  const { dataset, isLoading, error } = useDataset(id)
  const [highlight, setHighlight] = useState("")

  const [showLinkInfo, setShowLinkInfo] = useState(false)

  const [linkingVariables, setLinkingVariables] = useState([])
  const [countingLinks, setCountingLinks] = useState(false)

  useEffect(() => {
    setHighlight(router.query.s || "")
  }, [router.query])

  useEffect(() => {
    if (!dataset) return
    let linkVars = dataset.variables.filter((v) =>
      v.variable_id.includes("uid")
    )

    setCountingLinks(true)
    setLinkingVariables(linkVars.map((v) => ({ ...v, links: "loading" })))

    // count the number of datasets that link to this one
    // asyncronously, and update linkingVariables as each request completes
    linkVars.map((v, i) => {
      fetch(
        `/api/links?variable_id=${v.variable_id}&dataset_id=${v.dataset_id}`
      )
        .then((res) => res.json())
        .then((data) => {
          setLinkingVariables((old) => {
            const newVars = [...old]
            newVars[i] = {
              ...newVars[i],
              links: data,
            }
            return newVars
          })
        })
    })
    setCountingLinks(false)

    return () => {
      setCountingLinks(false)
      setLinkingVariables([])
    }
  }, [dataset])

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />
  if (error) return <>Error ...</>

  let description = dataset.description || ""
  if (highlight) {
    const searchMask = `(${highlight.replaceAll(" ", "|")})`
    const regEx = new RegExp(searchMask, "ig")
    const replaceMask = "<mark>$1</mark>"
    description = description.replace(regEx, replaceMask)
  }

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

      {linkingVariables.length && (
        <div>
          <h4 className="flex items-center">
            Linking variables
            <InformationCircleIcon
              className="h-4 w-4 ml-2 cursor-pointer hover:text-blue-700"
              onMouseEnter={() => setShowLinkInfo(true)}
              onMouseLeave={() => setShowLinkInfo(false)}
              // onClick={() => setShowLinkInfo(!showLinkInfo)}
            />
          </h4>
          <div className="relative">
            {showLinkInfo && (
              <p className="absolute bg-gray-100 px-4 py-2 my-0 shadow">
                The variables can be used to link to other datasets. The number
                in brackets shows the number of links possible. Clicking a
                variable will display a list of all matching variables.
              </p>
            )}
          </div>
          <ul>
            {linkingVariables.map((v) => (
              <Link
                key={v.variable_id}
                href={`/variables?s=${v.variable_id}&v=dataset&id=${dataset.dataset_id}`}
              >
                <li className="cursor-pointer flex items-center gap-2 underline hover:text-blue-600">
                  <SearchCircleIcon className="h-4 w-4" />
                  {v.variable_id}
                  {v.links === "loading" ? (
                    <Loading />
                  ) : (
                    <span>({v.links.length})</span>
                  )}
                </li>
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
        datasetId={dataset.dataset_id}
        title="Variables in this dataset"
        paginate={5}
      />
    </div>
  )
}

export default Dataset
