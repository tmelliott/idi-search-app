import Link from "next/link"
import { CogIcon, EyeIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import Collections from "./Collections"
import useAgency from "./hooks/useAgency"

function Agency({ id, term }) {
  const { agency, isLoading } = useAgency(id, term)

  if (isLoading) return <CogIcon className="h-10 animate-spin-slow mb-4" />

  return (
    <div className="prose">
      <Link href={`/agencies/${agency.agency_id}`}>
        <h2 className="cursor-pointer">{agency.agency_name} (Agency)</h2>
      </Link>

      <Collections
        items={agency.collections}
        title="Collections by this agency"
      />
    </div>
  )
}

export default Agency
