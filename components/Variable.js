import { CogIcon } from "@heroicons/react/outline"
import ReactMarkdown from "react-markdown"
import Dataset from "./Dataset"
import useVariable from "./hooks/useVariable"

function Variable({ d_id, v_id, action }) {
  const { variable, isLoading, error } = useVariable(d_id, v_id)

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />
  if (error) return <div>Error</div>

  console.log(variable)

  return (
    <div className="prose">
      <h2>{variable.variable_id} (Variable)</h2>
      <div className="text-xs">
        Dataset:{` `}
        <span
          className="underline cursor-pointer"
          onClick={() =>
            action(<Dataset id={variable.dataset.dataset_id} action={action} />)
          }
        >
          {variable.dataset.dataset_name}
        </span>
      </div>
      <div className="text-xs">
        In collection:{` `}
        <span
          className="underline cursor-pointer"
          onClick={() =>
            action(
              <Collection
                id={variable.dataset.collection.collection_id}
                action={action}
              />
            )
          }
        >
          {variable.dataset.collection.collection_name}
        </span>
      </div>
      <div className="text-xs">
        Agency:{` `}
        <span
          className="underline cursor-pointer"
          onClick={() =>
            action(
              <Agency
                id={variable.dataset.collection.agency.agency_id}
                action={action}
              />
            )
          }
        >
          {variable.dataset.collection.agency.agency_name}
        </span>
      </div>
      <ReactMarkdown>{variable.description}</ReactMarkdown>
    </div>
  )
}

export default Variable
