import { XCircleIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

import Collection from "../../components/Collection"
import Dataset from "../../components/Dataset"
import Search from "../../components/Search"

function CollectionPage() {
  const router = useRouter()
  const { collection } = router.query

  const filterTerm = router.query.s || ""

  const [info, setInfo] = useState(false)
  const [type, setType] = useState(null)
  const [typeId, setTypeId] = useState(null)

  useEffect(() => {
    const { v, id } = router.query
    setInfo(["agency", "collection", "dataset", "variable"].includes(v))
    setType(v)
    setTypeId(id)
  }, [router.query])

  const clearPanel = () => {
    const { v, id, ...rest } = router.query
    router.push(
      {
        pathname: router.query.pathname,
        query: rest,
      },
      undefined,
      { shallow: true }
    )
  }

  return (
    <div className="md:h-full flex md:overflow-x-hidden">
      <div className="flex-1 overflow-y-scroll">
        <Search />
        <Collection id={collection} term={filterTerm} />
      </div>

      <div
        className={`flex-1 p-4 shadow-md bg-gray-50 overflow-x-hidden ${
          info ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
        } transition fixed top-0 left-0 w-full md:overflow-y-scroll scrollbar-hide md:scrollbar-default
      h-full pt-4 md:static md:w-auto md:h-full md:top-auto md:left-auto`}
      >
        {info && (
          <>
            <div className="flex flex-row justify-end">
              <div
                className="flex flex-row text-xs items-center cursor-pointer hover:opacity-70"
                onClick={clearPanel}
              >
                Close
                <XCircleIcon className="h-6 ml-2" />
              </div>
            </div>
            {type === "dataset" && <Dataset id={typeId} />}
            {type === "variable" && <Variablee id={typeId} />}
          </>
        )}
      </div>
    </div>
  )
}

export default CollectionPage
