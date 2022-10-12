import { CogIcon, FilterIcon } from "@heroicons/react/outline"
import { usePlausible } from "next-plausible"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { event } from "../lib/gtag"

function Search() {
  const router = useRouter()
  const [value, setValue] = useState("")
  const disabled = false
  const inputRef = useRef()

  const [showConfig, setShowConfig] = useState(false)
  const [searchRefreshes, setSearchRefreshes] = useState(true)
  const [searchAdhoc, setSearchAdhoc] = useState(true)

  const plausible = usePlausible()

  useEffect(() => {
    setValue(router.query.s || "")
  }, [router.query])

  const updateQuery = () => {
    const { s, include, ...rest } = router.query
    let q = {
      ...router.query,
      s: value,
    }
    if (value === "") q = rest
    if (value !== "") {
      event("search", "general", value)
      plausible("Search", {
        props: {
          term: value,
        },
      })
    }
    if (!(searchRefreshes && searchAdhoc)) {
      let include = []
      if (searchRefreshes) include.push("refreshes")
      if (searchAdhoc) include.push("adhoc")
      q.include = include.join("_")
    }
    router.push(
      {
        pathname: router.pathname,
        query: q,
      },
      undefined,
      { shallow: true }
    )
  }

  return (
    <form
      className=""
      onSubmit={(e) => {
        e.preventDefault()
        updateQuery()
      }}
    >
      <div
        className={`flex items-center p-2 mb-2 border border-gray-400 rounded group ${
          disabled ? "bg-gray-100" : "bg-white"
        }`}
      >
        <FilterIcon className="h-5 mr-2 text-gray-400 group-focus-within:text-black" />
        <input
          value={value}
          type="text"
          ref={inputRef}
          className={`bg-transparent focus:outline-none w-full ${
            disabled ? "text-gray-600" : "text-black"
          }`}
          placeholder="Enter search term to filter results"
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
        />
        <button
          className="border rounded bg-gray-100 pl-2 pr-2 hover:bg-gray-200"
          disabled={disabled}
          type="submit"
        >
          Search
        </button>
        <button
          type="submit"
          className="border rounded border-gray-800 pl-2 pr-2 ml-2"
          onClick={() => {
            setValue("")
          }}
        >
          Clear
        </button>
        <CogIcon
          className="h-6 w-10 ml-2 cursor-pointer"
          onClick={() => setShowConfig((prev) => !prev)}
        />
      </div>

      {showConfig && (
        <div className="text-xs border-b pb-2">
          <p className="font-bold mb-1">Advanced search configuration</p>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={searchRefreshes}
                onChange={(e) => setSearchRefreshes(e.target.checked)}
              />{" "}
              Refreshes
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={searchAdhoc}
                onChange={(e) => setSearchAdhoc(e.target.checked)}
              />{" "}
              Adhoc
            </div>
          </div>
        </div>
      )}

      {router.pathname !== "/agencies" && (
        <div className="flex gap-2 justify-end items-center text-xxs mx-2">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-400"></span>
            <span>Metadata available</span>
          </div>
        </div>
      )}
    </form>
  )
}

export default Search
