import { useRouter } from "next/router"
import Link from "next/link"
import useAgencies from "./hooks/useAgencies"
import Loading from "./Loading.js"
import PagedTable from "./PagedTable"
import { LinkIcon } from "@heroicons/react/outline"

function Agencies({ term, limit }) {
  const router = useRouter()
  const { agencies, isLoading } = useAgencies(term)

  const showAgency = (agency) => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "agency",
          id: agency.agency_id,
        },
      },
      undefined,
      { shallow: true }
    )
  }
  if (!limit) limit = agencies?.length

  const tblCols = [{ name: "agency_name", label: "Name" }]

  return (
    <section>
      <h3>
        {router.asPath === "/agencies" ? (
          <>
            Data Supply Agencies ({isLoading ? <Loading /> : agencies.length})
          </>
        ) : (
          <Link
            href={`/agencies${router.query.s ? "?s=" + router.query.s : ""}`}
          >
            <a className="flex flex-row items-center gap-2 group">
              Data Supply Agencies ({isLoading ? <Loading /> : agencies.length})
              <LinkIcon
                height={15}
                className="inline text-blue-600 opacity-0 group-hover:opacity-100"
              />
            </a>
          </Link>
        )}
      </h3>

      {agencies?.length > 0 && (
        <PagedTable
          cols={tblCols}
          rows={agencies.map((a) => ({ ...a, id: a.agency_id }))}
          n={limit}
          rowHandler={showAgency}
        />
      )}
    </section>
  )
}

export default Agencies
