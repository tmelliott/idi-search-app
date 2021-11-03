import Agency from "./Agency"
import Loading from "./Loading.js"

function Agencies({ agencies, action, loading }) {
  const showAgency = (id) => {
    action(<Agency id={id} action={action} />)
  }
  return (
    <section>
      <h3>
        Agencies (
        {loading & (agencies.length === 0) ? <Loading /> : agencies.length})
      </h3>
      <ul>
        {agencies.map((agency) => (
          <li key={agency.agency_id}>
            <span
              className="cursor-pointer"
              onClick={() => showAgency(agency.agency_id)}
            >
              {agency.agency_name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Agencies
