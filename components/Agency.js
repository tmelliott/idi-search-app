import { CogIcon } from "@heroicons/react/outline"
import Collections from "./Collections"
import useAgency from "./hooks/useAgency"

function Agency({ id, action }) {
  const { agency, isLoading } = useAgency(id)

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />

  return (
    <div className="prose">
      <h2>{agency.agency_name} (Agency)</h2>
      <Collections
        collections={agency.collections}
        action={action}
        title="Collections by this agency"
      />
    </div>
  )
}

export default Agency