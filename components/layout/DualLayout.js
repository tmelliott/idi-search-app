import { XCircleIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Agency from "../Agency"
import Collection from "../Collection"
import Dataset from "../Dataset"
import Search from "../Search"
import Variable from "../Variable"
import Layout from "./Layout"

function DualLayout({ children }) {
  const router = useRouter()
  const [info, setInfo] = useState(false)
  const [type, setType] = useState(null)
  const [typeId, setTypeId] = useState(null)
  const [dId, setDId] = useState(null)

  useEffect(() => {
    const { v, id, dId } = router.query
    setInfo(["agency", "collection", "dataset", "variable"].includes(v))
    setType(v)
    setTypeId(id)
    setDId(v === "variable" ? dId : null)
  }, [router.query])

  const clearPanel = () => {
    const { v, id, d, ...rest } = router.query
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
    <Layout>
      <div className="h-full">
        <div className="md:h-full flex md:overflow-x-hidden">
          <div className="flex-1 overflow-y-scroll">
            <Search />
            {children}
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
                {type === "agency" && <Agency id={typeId} />}
                {type === "collection" && <Collection id={typeId} />}
                {type === "dataset" && <Dataset id={typeId} />}
                {type === "variable" && (
                  <Variable d_id={router.query.d} v_id={typeId} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default DualLayout
