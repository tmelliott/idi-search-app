import { useRouter } from "next/router"
import Link from "next/link"
import Agency from "./Agency"
import useAgencies from "./hooks/useAgencies"
import Loading from "./Loading.js"

function Agencies({ term, limit }) {
  const router = useRouter()
  const { agencies, isLoading } = useAgencies(term)

  const showAgency = (id) => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "agency",
          id: id,
        },
      },
      undefined,
      { shallow: true }
    )
  }
  const showAgencies = () => {
    router.push("/agencies")
  }
  if (!limit) limit = agencies?.length

  return (
    <section>
      <h3>Agencies ({isLoading ? <Loading /> : agencies.length})</h3>

      {agencies?.length > 0 && (
        <div className="app-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {agencies?.slice(0, limit).map((agency) => (
                <tr
                  key={agency.agency_id}
                  className="clickable"
                  onClick={() => showAgency(agency.agency_id)}
                >
                  <td>{agency.agency_name}</td>
                </tr>
              ))}
              {agencies && agencies.length > limit && limit > -1 && (
                <tr className="clickable">
                  <td onClick={showAgencies}>
                    <em>and {agencies.length - limit} more ...</em>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Agencies
