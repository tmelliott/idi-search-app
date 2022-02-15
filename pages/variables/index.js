import Head from "next/head"
import { useRouter } from "next/router"
import DualLayout from "../../components/layout/DualLayout"

import Variables from "../../components/Variables"

// a list of datasets
function VariablesPage() {
  const router = useRouter()
  const filterTerm = router.query.s || ""

  return (
    <>
      <Head>
        <title>Variables | IDI Search</title>
      </Head>

      <Variables term={filterTerm} limit={25} />
    </>
  )
}

VariablesPage.Layout = DualLayout

export default VariablesPage
