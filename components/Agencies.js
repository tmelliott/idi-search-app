import Agency from "./Agency"
import useAgencies from "./hooks/useAgencies"
import Loading from "./Loading.js"

function Agencies({ agencies, action, term, limit }) {
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
    action(<Agencies agencies={agencies} action={action} term={term} />)
  }
  if (!limit) limit = results.length
  return (
    <section>
      <h3>Agencies ({isLoading ? <Loading /> : results.length})</h3>
      <ul>
        {results?.slice(0, limit).map((agency) => (
          <li key={agency.agency_id}>
            <span
              className="cursor-pointer"
              onClick={() => showAgency(agency.agency_id)}
            >
              {agency.agency_name}
            </span>
          </li>
        ))}
        {results && results.length > limit && limit > -1 && (
          <li>
            <span className="cursor-pointer" onClick={showAgencies}>
              <em>and {results.length - limit} more ...</em>
            </span>
          </li>
        )}
      </ul>
    </section>
  )
}

export default Agencies
