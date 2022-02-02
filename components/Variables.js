import useVariables from "./hooks/useVariables"
import Loading from "./Loading"
import { useRouter } from "next/router"
import Paginator from "./Paginator"
import { useEffect, useState } from "react"

function Variables({ term, datasetId, limit, title = "Variables", paginate }) {
  const router = useRouter()
  const { variables, isLoading } = useVariables(term, datasetId)

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
  if (!limit) limit = variables?.vars.length
  if (paginate) limit = paginate

  const [pagination, setPagination] = useState({})
  const [pA, setPA] = useState(0)
  const [pB, setPB] = useState(limit)

  useEffect(() => {
    if (!paginate) return
    setPagination({
      page: 0,
      nPerPage: limit,
      nPage: Math.ceil(variables?.vars.length / limit) || 0,
    })
  }, [variables])

  useEffect(() => {
    if (paginate === undefined) return
    setPA(pagination.page * pagination.nPerPage)
    setPB((pagination.page + 1) * pagination.nPerPage)
  }, [pagination])

  return (
    <section>
      <h3>
        {title} ({isLoading ? <Loading /> : variables.n})
      </h3>{" "}
      {variables?.vars.length > 0 && (
        <div className="app-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Dataset</th>
              </tr>
            </thead>
            <tbody>
              {variables?.vars.slice(pA, pB).map((variable) => (
                <tr
                  key={variable.variable_id + variable.dataset_id}
                  className="clickable"
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
              {variables &&
              variables.vars &&
              variables.vars.length > limit &&
              limit > -1 &&
              paginate ? (
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
                    <em>and {variables.vars.length - limit} more ...</em>
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
