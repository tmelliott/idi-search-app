import { CogIcon } from "@heroicons/react/outline"
import ReactMarkdown from "react-markdown"
import Agency from "./Agency"
import Collection from "./Collection"
// import Variables from "./Variables"
import useDataset from "./hooks/useDataset"
import Variables from "./Variables"

function Dataset({ id, action }) {
  const { dataset, isLoading } = useDataset(id)

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />

  return (
    <div className="prose">
      <h2>{dataset.dataset_name} (Dataset)</h2>
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
      <ReactMarkdown>{dataset.description}</ReactMarkdown>
      <Variables
        variables={dataset.variables}
        action={action}
        title="Variables in this dataset"
      />
    </div>
  )
}

export default Dataset
