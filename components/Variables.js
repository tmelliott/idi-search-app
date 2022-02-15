import Link from "next/link"
import Loading from "./Loading"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import PagedTable from "./PagedTable"
import { LinkIcon } from "@heroicons/react/outline"
import useVariables from "./hooks/useVariables"

// const loadAllVariables = async (term = "", datasetId = "") => {
//   let p = 1
//   let res = await fetch(
//     `/api/variables?q=${term}&datasetId=${datasetId}&page=${p}&size=10000`
//   )
//   let data = await res.json()

//   const n = data.n
//   let variables = []
//   variables = variables.concat(data.vars)
//   while (variables.length < n) {
//     p++
//     res = await fetch(
//       `/api/variables?q=${term}&datasetId=${datasetId}&page=${p}&size=10000`
//     )
//     data = await res.json()
//     variables = variables.concat(data.vars)
//   }

//   return {
//     variables: variables,
//   }
// }

function Variables({ term, datasetId, limit = 10, title = "Variables" }) {
  const router = useRouter()

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(limit)
  const { variables, isError, isLoading } = useVariables(
    term,
    datasetId,
    page + 1,
    size
  )

  useEffect(() => {
    setSize(limit)
  }, [limit])
  const [allVars, setAllVars] = useState([])

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

  useEffect(() => {
    if (variables) setAllVars(variables)
  }, [variables])

  return (
    <section>
      <h3>
        {router.asPath === "/datasets" ? (
          <>Variables ({isLoading ? <Loading /> : variables?.n})</>
        ) : (
          <Link href="/variables">
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
          }))}
          n={limit}
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
