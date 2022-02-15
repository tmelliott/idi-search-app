import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import DualLayout from "../../components/layout/DualLayout"

import Variables from "../../components/Variables"

// a list of datasets
function VariablesPage() {
  const router = useRouter()
  const filterTerm = router.query.s || ""

  const [limit, setLimit] = useState(15)
  const limitOptions = [5, 15, 25, 50, 100, 500]

  return (
    <>
      <Head>
        <title>Variables | IDI Search</title>
      </Head>

      <div className="flex flex-row items-center mt-2 text-xs">
        <div className="mr-2">Results per page:</div>
        {limitOptions.map((lo) => (
          <div
            className={`cursor-pointer ${
              lo === limit ? "bg-gray-300 font-bold" : "bg-gray-100"
            } mx-1 p-1 w-8 text-center rounded`}
            onClick={() => setLimit(lo)}
          >
            {lo}
          </div>
        ))}
      </div>

      <Variables term={filterTerm} limit={limit} />
    </>
  )
}

VariablesPage.Layout = DualLayout

export default VariablesPage
