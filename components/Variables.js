import Link from "next/link"
import Loading from "./Loading"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import PagedTable from "./PagedTable"
import { LinkIcon } from "@heroicons/react/outline"
import useVariables from "./hooks/useVariables"

function Variables({ limit = 10, datasetId, title = "Variables" }) {
  const router = useRouter()
  const [term, setTerm] = useState("")
  const [include, setInclude] = useState("all")
  const [exact, setExact] = useState(false)

  useEffect(() => {
    setTerm(router.query.s || "")
  }, [router.query.s])

  useEffect(() => {
    setInclude(router.query.include || "all")
  }, [router.query.include])

  useEffect(() => {
    setExact(router.query.exact === "true" || false)
  }, [router.query.exact])

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(limit)
  const { variables, isError, isLoading } = useVariables(
    term,
    include,
    exact,
    datasetId,
    page + 1,
    size
  )
  const [allVars, setAllVars] = useState({})

  useEffect(() => {
    setSize(limit)
  }, [limit])

  useEffect(() => {
    setAllVars({})
  }, [limit, term, include, exact, datasetId])

  const showVariable = (variable) => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "variable",
          d: variable.dataset_id,
          id: variable.variable_id,
        },
      },
      undefined,
      { shallow: true }
    )
  }

  const tblCols = [
    {
      name: "variable_name",
      label: "Name",
      value: (v) => (
        <>
          <div>{v.variable_name}</div>
          <div className="text-xxs font-mono">{v.variable_id}</div>
        </>
      ),
    },
    {
      name: "dataset_name",
      label: "Dataset / Collection",
      value: (r) => (
        <div className="flex items-center justify-between gap-1 mr-2">
          {r.dataset ? (
            <div className="">
              <div>{r.dataset.dataset_name}</div>
              <div className="text-xxs">
                {r.dataset.collection ? (
                  r.dataset.collection.collection_name
                ) : (
                  <>&nbsp;</>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 italic text-xxs">Not available</div>
          )}
          {r.metadata && (
            <span className="h-2 w-2 rounded-full bg-green-400"></span>
          )}
        </div>
      ),
    },
  ]

  useEffect(() => {
    if (variables) setAllVars(variables)
  }, [variables])

  console.groupEnd()

  return (
    <section>
      <h3>
        {router.asPath === "/datasets" ? (
          <>Variables ({isLoading ? <Loading /> : variables?.n})</>
        ) : (
          <Link
            href={`/variables${router.query.s ? "?s=" + router.query.s : ""}`}
          >
            <a className="flex flex-row items-center gap-2 group">
              Variables ({isLoading ? <Loading /> : variables?.n})
              <LinkIcon
                height={15}
                className="inline text-blue-600 opacity-0 group-hover:opacity-100"
              />
            </a>
          </Link>
        )}
      </h3>

      {allVars.n > 0 && (
        <PagedTable
          cols={tblCols}
          rows={allVars.vars.map((v) => ({
            ...v,
            dataset_name: v.dataset?.dataset_name,
            id: v.variable_id + "__" + v.dataset_id,
            metadata: v.description,
          }))}
          n={Math.min(limit, allVars.n)}
          rowHandler={showVariable}
          lazy={{
            n: allVars.n,
            page: page,
            setPage: setPage,
            loading: isLoading,
          }}
        />
      )}
    </section>
  )
}

export default Variables
