import Agency from "./Agency"

function Agencies({ agencies, action }) {
  const showAgency = (id) => {
    action(<Agency id={id} action={action} />)
  }
  return (
    <section>
      <h3>Agencies ({agencies.length})</h3>
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
