import Link from "next/link"
import Loading from "./Loading"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import PagedTable from "./PagedTable"
import { LinkIcon } from "@heroicons/react/outline"

const loadAllVariables = async (term = "", datasetId = "") => {
  let p = 1
  let res = await fetch(
    `/api/variables?q=${term}&datasetId=${datasetId}&page=${p}&size=10000`
  )
  let data = await res.json()

  const n = data.n
  let variables = []
  variables = variables.concat(data.vars)
  while (variables.length < n) {
    p++
    res = await fetch(
      `/api/variables?q=${term}&datasetId=${datasetId}&page=${p}&size=10000`
    )
    data = await res.json()
    variables = variables.concat(data.vars)
  }

  return {
    variables: variables,
  }
}

function Variables({ term, datasetId, limit, title = "Variables" }) {
  const router = useRouter()

  const [isLoading, setLoading] = useState(true)
  const [variables, setVars] = useState([])

  useEffect(() => {
    setLoading(true)
    setVars([])
    const setAllVars = async () => {
      const vs = await loadAllVariables(term, datasetId)
      setVars(vs.variables)
      setLoading(false)
    }
    setAllVars()
  }, [term, datasetId])

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

  if (!limit) limit = variables?.length

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
      value: (r) => {
        return r.dataset ? (
          <>
            <div>{r.dataset.dataset_name}</div>
            <div className="text-xxs">
              {r.dataset.collection?.collection_name}
            </div>
          </>
        ) : (
          <div className="text-gray-400 italic text-xxs">Not available</div>
        )
      },
    },
  ]

  return (
    <section>
      <h3>
        {router.asPath === "/datasets" ? (
          <>Variables ({isLoading ? <Loading /> : variables.length})</>
        ) : (
          <Link href="/variables">
            <a className="flex flex-row items-center gap-2 group">
              Variables ({isLoading ? <Loading /> : variables.length})
              <LinkIcon
                height={15}
                className="inline text-blue-600 opacity-0 group-hover:opacity-100"
              />
            </a>
          </Link>
        )}
      </h3>

      {variables.length > 0 && (
        <PagedTable
          cols={tblCols}
          rows={variables.map((v) => ({
            ...v,
            dataset_name: v.dataset?.dataset_name,
            id: v.variable_id + "__" + v.dataset_id,
          }))}
          n={limit}
          rowHandler={showVariable}
        />
      )}

      {/* {allVars?.vars.length > 0 && (
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
      )} */}
    </section>
  )
}

export default Variables
