import { useRouter } from "next/router"
import Agency from "./Agency"
import useAgencies from "./hooks/useAgencies"
import Loading from "./Loading.js"

function Agencies({ agencies, action, term, limit }) {
  const router = useRouter()
  const { agencies: results, isLoading } = term
    ? useAgencies(term)
    : {
        agencies: agencies,
        isLoading: false,
      }

  const showAgency = (id) => {
    action(<Agency id={id} action={action} />)
  }
  const showAgencies = () => {
    router.push("/agencies")
  }
  if (!limit) limit = results.length
  return (
    <section>
      <h3>Agencies ({isLoading ? <Loading /> : results.length})</h3>

      {!isLoading && (
        <div className="app-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {results?.slice(0, limit).map((agency) => (
                <tr
                  className="clickable"
                  onClick={() => showAgency(agency.agency_id)}
                >
                  <td>{agency.agency_name}</td>
                </tr>
              ))}
              {results && results.length > limit && limit > -1 && (
                <tr className="clickable">
                  <td colSpan="2" onClick={showAgencies}>
                    <em>and {results.length - limit} more ...</em>
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
