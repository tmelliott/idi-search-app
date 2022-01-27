import Head from "next/head"
import { useRouter } from "next/router"
import DualLayout from "../../components/layout/DualLayout"

import Agencies from "../../components/Agencies"

// a list of agencies
function AgenciesPage() {
  const router = useRouter()
  const filterTerm = router.query.s || ""

  return (
    <>
      <Head>
        <title>Agencies | IDI Search</title>
      </Head>

      <Agencies term={filterTerm} />
    </>
  )
}

AgenciesPage.Layout = DualLayout

export default AgenciesPage
