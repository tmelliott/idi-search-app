import {
  CogIcon,
  DocumentDownloadIcon,
  FilterIcon,
} from "@heroicons/react/outline"
import { usePlausible } from "next-plausible"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import Loading from "./Loading"

const EXPORT_FORMATS = ["CSV", "JSON"]

function Search() {
  const router = useRouter()

  const [value, setValue] = useState("")
  const disabled = false
  const inputRef = useRef()

  const [showConfig, setShowConfig] = useState(false)
  const [searchRefreshes, setSearchRefreshes] = useState(true)
  const [searchAdhoc, setSearchAdhoc] = useState(true)
  const [exactSearch, setExactSearch] = useState(false)

  const [promptDownload, setPromptDownload] = useState(false)
  const [loadingResults, setLoadingResults] = useState(false)

  const plausible = usePlausible()

  useEffect(() => {
    if (!router.isReady) return

    setValue(router.query.s || "")

    const include = router.query.include
    if (include) {
      setSearchRefreshes(
        include.includes("all") || include.includes("refreshes")
      )
      setSearchAdhoc(include.includes("all") || include.includes("adhoc"))
    } else {
      setSearchRefreshes(true)
      setSearchAdhoc(true)
    }
    if (router.query.exact) setExactSearch(router.query.exact === "true")
    else setExactSearch(false)
  }, [router.isReady])

  useEffect(() => {
    updateQuery()
  }, [searchRefreshes, searchAdhoc, exactSearch])

  const updateQuery = () => {
    const { s, include, exact, ...rest } = router.query
    let q = {
      ...rest,
      s: value,
    }

    if (value === "") q = rest
    if (value !== "") {
      plausible("Search", {
        props: {
          term: value,
        },
      })
    }

    if (!(searchRefreshes && searchAdhoc)) {
      let includes = []
      if (searchRefreshes) includes.push("refreshes")
      if (searchAdhoc) includes.push("adhoc")
      q.include = includes.join("_")
    }

    if (exactSearch) q.exact = "true"

    router.push(
      {
        pathname: router.pathname,
        query: q,
      },
      undefined,
      { shallow: true }
    )
  }

  const fetchData = async (table) => {
    const { s, include } = router.query

    let apiURL = new URL(`${window.location.origin}/api/${table}`)
    if (s) apiURL.searchParams.set("q", s)
    if (table === "variables" && include)
      apiURL.searchParams.set("include", include)
    if (table === "variables") apiURL.searchParams.set("description", "true")

    const res = await fetch(apiURL)
    const data = await res.json()
    return data
  }

  const downloadResults = async (format) => {
    // get current router
    const route = router.route
    setPromptDownload(false)
    setLoadingResults(true)

    let results
    if (route === "/") {
      // fetch combined agencies, collections, datasets, and variables
      const agencies = fetchData("agencies")
      const collections = fetchData("collections")
      const datasets = fetchData("datasets")
      const variables = fetchData("variables")

      const res = await Promise.all([
        agencies,
        collections,
        datasets,
        variables,
      ])

      results = {
        agencies: res[0],
        collections: res[1],
        datasets: res[2],
        variables: res[3].vars,
      }
    } else {
      // fetch data for current route
      switch (route) {
        case "/agencies":
          // fetch agencies
          results = await fetchData("agencies")
          break
        case "/collections":
          // fetch collections
          results = await fetchData("collections")
          break
        case "/datasets":
          // fetch datasets
          results = await fetchData("datasets")
          break
        case "/variables":
          // fetch variables
          results = await fetchData("variables")
          break
      }
    }

    if (format === "CSV") {
      // convert to CSV
      if (route === "/") {
        // convert combined results to CSV
        setLoadingResults(false)
        return
      }

      // create CSV data
      let headers = [],
        data = []
      if (route === "/agencies") {
        // convert agencies to CSV
        headers = ["agency_id", "agency_name"]
        data = results.map((d) => [d.agency_id, d.agency_name])
      }
      if (route === "/collections") {
        // convert collections to CSV
        headers = [
          "collection_id",
          "collection_name",
          "description",
          "agency_name",
        ]
        data = results.map((d) => [
          d.collection_id,
          d.collection_name,
          d.description ? '"' + d.description + '"' : "",
          d.agency.agency_name,
        ])
      }
      if (route === "/datasets") {
        headers = ["dataset_id", "dataset_name", "collection_id", "description"]
        data = results.map((d) => [
          d.dataset_id,
          d.dataset_name,
          d.collection_id,
          d.description ? '"' + d.description + '"' : "",
        ])
      }
      if (route === "/variables") {
        headers = ["variable_id", "variable_name", "dataset_id", "description"]
        data = results.vars.map((d) => [
          d.variable_id,
          d.variable_name,
          d.dataset_id,
          d.description ? '"' + d.description + '"' : "",
        ])
      }

      const csvData = data.map((row) => {
        return row.join(",")
      })
      const csvHeaders = headers.join(",")

      downloadFile({
        data: [csvHeaders, ...csvData].join("\n"),
        fileName: `idi-search-results.csv`,
        fileType: "text/csv",
      })
    } else if (format === "JSON") {
      // download JSON
      downloadFile({
        data: JSON.stringify(results),
        fileName: `idi-search-results.json`,
        fileType: "text/json",
      })
    }

    setLoadingResults(false)
  }

  return (
    <form
      className="@container"
      onSubmit={(e) => {
        e.preventDefault()
        updateQuery()
      }}
    >
      <div
        className={`flex flex-col w-full items-stretch gap-2 @lg:flex-row  @lg:gap-0 p-2 mb-2 border border-gray-400 rounded group ${
          disabled ? "bg-gray-100" : "bg-white"
        }`}
      >
        <div className="flex items-center flex-1">
          <FilterIcon className="h-5 mr-2 text-gray-400 group-focus-within:text-black" />
          <input
            value={value}
            type="text"
            ref={inputRef}
            className={`bg-transparent focus:outline-none w-full flex-1 ${
              disabled ? "text-gray-600" : "text-black"
            }`}
            placeholder="Enter search term to filter results"
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="flex items-center">
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

            <div className="border border-gray-300 h-6"></div>

            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={exactSearch}
                onChange={(e) => setExactSearch(e.target.checked)}
              />{" "}
              Exact search (only results that exactly match the search string
              will be shown)
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end items-center text-xxs mx-2">
        {router.pathname !== "/agencies" && (
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-400"></span>
            <span>Metadata available</span>
          </div>
        )}

        {/* download button */}
        <div className="relative group">
          <DocumentDownloadIcon
            className="h-5 cursor-pointer"
            onClick={() => setPromptDownload(true)}
          />
          <div className="absolute top-100 right-0 m-1 bg-gray-100 text-gray-600 text-xxs rounded shadow p-1 whitespace-nowrap hidden group-hover:block">
            Download results
          </div>

          {promptDownload && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-start py-[20vh] justify-center z-50 text-base"
              onClick={(e) => {
                if (e.target === e.currentTarget) setPromptDownload(false)
              }}
            >
              <div className="bg-white rounded shadow-lg p-4">
                <p className="font-bold mb-2 text-center">Download results</p>
                <p className="mb-2">Choose a format to export results as.</p>
                <div className="flex flex-col gap-2">
                  {EXPORT_FORMATS.map((format) => (
                    <button
                      key={format}
                      className="border rounded border-gray-800 pl-2 pr-2 hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 disabled:bg-gray-100 flex items-center justify-center gap-2"
                      onClick={() => downloadResults(format)}
                      disabled={
                        router.route === "/" && format === "CSV"
                          ? "disabled"
                          : ""
                      }
                    >
                      {format}
                      {format === "CSV" && router.route === "/" && (
                        <span className="text-xs">
                          {" "}
                          - not available for all results
                        </span>
                      )}
                    </button>
                  ))}
                  <hr />
                  <button
                    className="border rounded border-gray-800 pl-2 pr-2 hover:bg-red-400 bg-red-300"
                    onClick={() => setPromptDownload(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {loadingResults && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start py-[20vh] justify-center z-50 text-base">
              <div className="bg-white rounded shadow-lg p-4 text-center gap-2">
                <p className="font-bold mb-2 text-center">Download results</p>
                <CogIcon className="inline h-12 animate-spin" />
                <p className="mb-2">
                  Your file will download once it is ready.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}

export default Search

const downloadFile = ({ data, fileName, fileType }) => {
  // Create a blob with the data we want to download as a file
  const blob = new Blob([data], { type: fileType })
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement("a")
  a.download = fileName
  a.href = window.URL.createObjectURL(blob)
  const clickEvt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  })
  a.dispatchEvent(clickEvt)
  a.remove()
}
