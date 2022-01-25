import { CogIcon } from "@heroicons/react/outline"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import Agency from "./Agency"
import Collection from "./Collection"
// import Variables from "./Variables"
import useDataset from "./hooks/useDataset"
import Variables from "./Variables"

function Dataset({ id, action, highlight, setFilterTerm }) {
  const { dataset, isLoading } = useDataset(id)

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />

  let description = dataset.description
  if (highlight) {
    const searchMask = `(${highlight})`
    const regEx = new RegExp(searchMask, "ig")
    const replaceMask = "<mark>$1</mark>"
    description = description.replace(regEx, replaceMask)
  }

  const linkingVars = dataset.variables.filter((v) =>
    v.variable_id.includes("uid")
  )

  const searchVar = (v) => {
    setFilterTerm && setFilterTerm(v)
  }

  return (
    <div className="prose">
      <h2>{dataset.dataset_name} (Dataset)</h2>
      {dataset.collection && (
        <div className="text-xs">
          In collection:{` `}
          <span
            className="underline cursor-pointer"
            onClick={() =>
              action(
                <Collection
                  id={dataset.collection.collection_id}
                  action={action}
                />
              )
            }
          >
            {dataset.collection.collection_name}
          </span>
        </div>
      )}
      {dataset.collection && dataset.collection.agency && (
        <div className="text-xs">
          Agency:{` `}
          <span
            className="underline cursor-pointer"
            onClick={() =>
              action(
                <Agency
                  id={dataset.collection.agency.agency_id}
                  action={action}
                />
              )
            }
          >
            {dataset.collection.agency.agency_name}
          </span>
        </div>
      )}
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown>

      {linkingVars.length > 0 && (
        <div>
          <h4>Linking variables</h4>
          <p>These variables can be used to link to other datasets.</p>
          <ul>
            {linkingVars.map((v) => (
              <li
                key={v.variable_id}
                className="cursor-pointer"
                onClick={() => searchVar(v.variable_id)}
              >
                {v.variable_id}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Variables
        items={dataset.variables}
        action={action}
        title="Variables in this dataset"
      />
    </div>
  )
}

export default Dataset
