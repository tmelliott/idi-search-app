import Collections from "../../components/Collections"
import getAgencies from "../../components/database/agencies"
import getAgency from "../../components/database/agency"

export default function Agency({ agency }) {
  return (
    <div>
      <h1>{agency.agency_name}</h1>

      <Collections collections={agency.collections} />
    </div>
  )
}

export async function getStaticProps(context) {
  const { agency_id } = context.params
  const agency = await getAgency(agency_id)
  return {
    props: {
      agency,
    },
  }
}

export async function getStaticPaths() {
  const agencies = await getAgencies()
  const paths = (await agencies).map((agency) => ({
    params: { agency_id: agency.agency_id },
  }))
  return { paths, fallback: false }
}
