import { useRouter } from "next/router"
import Head from "next/head"
import DualLayout from "../../components/layout/DualLayout"
import Agency from "../../components/Agency"
import useAgency from "../../components/hooks/useAgency"

function AgencyPage() {
  const router = useRouter()
  const filterTerm = router.query.s || ""
  const id = router.query.agency

  const { agency, isLoading } = useAgency(id)

  return (
    <>
      <Head>
        <title>
          {isLoading ? id : agency.agency_name} | Agency | IDI Search
        </title>
      </Head>

      <Agency id={id} term={filterTerm} />
    </>
  )
}

AgencyPage.Layout = DualLayout

export default AgencyPage
