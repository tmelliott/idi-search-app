import Head from "next/head"
import { useRouter } from "next/router"
import DualLayout from "../../components/layout/DualLayout"

import Collections from "../../components/Collections"

// a list of collections
function CollectionsPage() {
  const router = useRouter()
  const filterTerm = router.query.s || ""

  return (
    <>
      <Head>
        <title>Collections | IDI Search</title>
      </Head>

      <Collections term={filterTerm} />
    </>
  )
}

CollectionsPage.Layout = DualLayout

export default CollectionsPage
