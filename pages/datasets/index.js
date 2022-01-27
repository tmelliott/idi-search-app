import Head from "next/head"
import { useRouter } from "next/router"
import DualLayout from "../../components/layout/DualLayout"

import Datasets from "../../components/Datasets"

// a list of datasets
function DatasetsPage() {
  const router = useRouter()
  const filterTerm = router.query.s || ""

  return (
    <>
      <Head>
        <title>Datasets | IDI Search</title>
      </Head>

      <Datasets term={filterTerm} />
    </>
  )
}

DatasetsPage.Layout = DualLayout

export default DatasetsPage
