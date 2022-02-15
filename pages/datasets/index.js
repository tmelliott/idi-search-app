import Head from "next/head"
import { useRouter } from "next/router"
import DualLayout from "../../components/layout/DualLayout"

import Datasets from "../../components/Datasets"
import { useState } from "react"

// a list of datasets
function DatasetsPage() {
  const router = useRouter()
  const filterTerm = router.query.s || ""

  const [limit, setLimit] = useState(15)
  const limitOptions = [5, 15, 25, 50, 100, "All"]

  return (
    <>
      <Head>
        <title>Datasets | IDI Search</title>
      </Head>

      <Datasets term={filterTerm} limit={limit === "All" ? null : limit} />

      <div className="flex flex-row items-center mt-2 text-xs">
        <div className="mr-2">Results per page:</div>
        {limitOptions.map((lo) => (
          <div
            key={lo}
            className={`cursor-pointer ${
              lo === limit ? "bg-gray-300 font-bold" : "bg-gray-100"
            } mx-1 p-1 w-8 text-center rounded`}
            onClick={() => setLimit(lo)}
          >
            {lo}
          </div>
        ))}
      </div>
    </>
  )
}

DatasetsPage.Layout = DualLayout

export default DatasetsPage
