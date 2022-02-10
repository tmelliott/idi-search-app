import useVariables from "./hooks/useVariables"
import Loading from "./Loading"
import Link from "next/link"
import { useRouter } from "next/router"
import Paginator from "./Paginator"
import { useEffect, useState } from "react"
import { EyeIcon } from "@heroicons/react/outline"

function Variables({
  term,
  datasetId,
  title = "Variables",
  paginate = 30,
  linkTo,
}) {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(paginate)
  const { variables, isLoading, isError } = useVariables(
    term,
    datasetId,
    page,
    pageSize
  )

  const showVariable = (d_id, v_id) => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "variable",
          d: d_id,
          id: v_id,
        },
      },
      undefined,
      { shallow: true }
    )
  }
  const showVariables = () => {
    router.push("/variables")
  }

  const [pagination, setPagination] = useState({})
  const [allVars, setAllVars] = useState(null)

  useEffect(() => {
    if (variables) setAllVars(variables)
  }, [variables])

  useEffect(() => {
    setPagination({
      page: page,
      nPerPage: pageSize,
      nPage: Math.ceil(allVars?.n / pageSize) || 0,
    })
  }, [allVars])

  useEffect(() => {
    if (paginate === undefined) return
    setPage(pagination.page)
  }, [pagination])

  if (isError) return <>Unable to get results</>

  return (
    <section>
      <h3>
        {title} ({isLoading && !allVars ? <Loading /> : allVars?.n})
        {linkTo && (
          <Link href={linkTo}>
            <a>
              <EyeIcon className="cursor-pointer inline ml-3" height={20} />
            </a>
          </Link>
        )}
      </h3>{" "}
      {allVars?.vars.length > 0 && (
        <div className="app-table relative">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Dataset</th>
              </tr>
            </thead>
            <tbody>
              {allVars?.vars.map((variable) => (
                <tr
                  key={variable.variable_id + variable.dataset_id}
                  className={`clickable ${isLoading && "text-gray-400"}`}
                  onClick={() =>
                    showVariable(variable.dataset_id, variable.variable_id)
                  }
                >
                  <td>
                    <div className="flex flex-col items-start">
                      <div>
                        {variable.variable_name || variable.variable_id}
                      </div>
                      {variable.variable_name !== undefined && (
                        <div className="text-xxs font-mono">
                          {variable.variable_id}
                        </div>
                      )}
                    </div>
                  </td>
                  {variable.dataset && (
                    <td>
                      <div className="flex flex-col items-start">
                        <div>{variable.dataset.dataset_name}</div>
                        {variable.dataset.collection && (
                          <div className="text-xxs">
                            {variable.dataset.collection.collection_name},{" "}
                            {variable.dataset.collection.agency.agency_name}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {allVars && allVars.vars && allVars.n > paginate && paginate ? (
                <tr>
                  <td colSpan="2">
                    <Paginator
                      pagination={pagination}
                      handler={setPagination}
                    />
                  </td>
                </tr>
              ) : (
                <tr className="clickable">
                  <td colSpan="2" onClick={showVariables}>
                    <em>and {allVars.n - paginate} more ...</em>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Variables
