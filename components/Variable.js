import { CogIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"

import useVariable from "./hooks/useVariable"
import Refreshes from "./Refreshes"
import { useEffect, useState } from "react"

function Variable({ d_id, v_id }) {
  console.log(d_id, v_id)
  const router = useRouter()
  const { variable, isLoading, error } = useVariable(d_id, v_id)
  const [highlight, setHighlight] = useState("")

  useEffect(() => {
    setHighlight(router.query.s || "")
  }, [router.query])

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />
  if (error) return <div>Error</div>

  let description = variable.description || ""
  if (highlight) {
    const searchMask = `(${highlight})`
    const regEx = new RegExp(searchMask, "ig")
    const replaceMask = "<mark>$1</mark>"
    description = description.replace(regEx, replaceMask)
  }

  return (
    <div className="prose">
      <h2>{variable.variable_name || variable.variable_id} (Variable)</h2>
      <div className="text-xs">
        Dataset:{` `}
        <Link href={`/datasets/${variable.dataset.dataset_id}`}>
          <a className="underline cursor-pointer">
            {variable.dataset.dataset_name}
          </a>
        </Link>
      </div>
      {variable.dataset.collection && (
        <div className="text-xs">
          In collection:{` `}
          <Link
            href={`/collections/${variable.dataset.collection.collection_id}`}
          >
            <a className="underline cursor-pointer">
              {variable.dataset.collection.collection_name}
            </a>
          </Link>
        </div>
      )}

      {variable.dataset.collection && variable.dataset.collection.agency && (
        <div className="text-xs">
          Agency:{` `}
          <Link
            href={`/agencies/${variable.dataset.collection.agency.agency_id}`}
          >
            <a className="underline cursor-pointer">
              {variable.dataset.collection.agency.agency_name}
            </a>
          </Link>
        </div>
      )}

      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown>

      <div className="">
        <h4>SQL Information</h4>

        <table>
          <tbody>
            <tr>
              <td className="font-bold">Field Name</td>
              <td>{variable.variable_id}</td>
            </tr>
            <tr>
              <td className="font-bold">Table Name</td>
              <td>{variable.dataset_id}</td>
            </tr>
            <tr>
              <td className="font-bold">Type</td>
              <td>{variable.type}</td>
            </tr>
            {variable.size && (
              <tr>
                <td className="font-bold">Size</td>
                <td>{variable.size}</td>
              </tr>
            )}
            <tr>
              <td className="font-bold">Database</td>
              <td>{variable.database || "Missing - please let us know"}</td>
            </tr>
          </tbody>
        </table>

        {variable.database === "IDI Clean" &&
          variable.refreshes &&
          (variable.refreshes.length > 0 ? (
            <Refreshes refreshes={variable.refreshes} />
          ) : (
            <div>
              <strong>Catalog: </strong> {variable.refreshes}
            </div>
          ))}

        {variable.matches.length > 0 && (
          <>
            <h4>This variable may have a different name in other refreshes:</h4>
            <p>Coming soon &hellip;</p>
          </>
        )}

        {variable.dataset.matches.length > 0 && (
          <>
            <h4>
              This variable may be available in other refreshes in a difference
              dataset:
            </h4>
            <ul>
              {variable.dataset.matches.map((d) => (
                <li>
                  <Link key={d.dataset_id} href={`/datasets/${d.dataset_id}`}>
                    <a>{d.dataset_name}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export default Variable
