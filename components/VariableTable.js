import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { CogIcon, FilterIcon } from "@heroicons/react/outline"

import { DataGrid } from "@mui/x-data-grid"

function VariableTable({ filterTerm, setFilterTerm }) {
  const router = useRouter()
  const [data, setData] = useState(null)

  const fetchData = async () => {
    const res = await fetch(
      "/api/search_variables?search=variables&term=" + filterTerm
    )
    const ret = await res.json()
    setData(
      ret.map((row) => ({
        ...row,
        agency_table: row.agency + " / " + row.table,
      }))
    )
  }

  const columns = [
    { field: "agency_table", headerName: "Agency / Table", flex: 1 },
    { field: "variable", headerName: "Variable name", flex: 1 },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  // useEffect(() => {
  //   console.table(data)
  // }, [data])

  return (
    <div className="h-full">
      {!data ? (
        <div className="flex flex-col items-center justify-center my-20">
          <CogIcon className="h-20 animate-spin-slow mb-4" />
          <h5 className="text-xl">Loading</h5>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex items-center bg-white p-2 mb-2 border border-gray-400 rounded group">
            <FilterIcon className="h-5 mr-2 text-gray-400 group-focus-within:text-black" />
            <input
              value={filterTerm}
              type="text"
              className="bg-white focus:outline-none w-full"
              placeholder="Enter search term to filter variables"
              onChange={(e) => {
                setFilterTerm(e.target.value)
                fetchData()
              }}
            />
          </div>
          <div className="flex-1">
            <DataGrid
              rows={data}
              columns={columns}
              disableColumnMenu
              onChange={fetchData}
              pagination
              autoPageSize
              disableSelectionOnClick
              onRowClick={(d, e) =>
                router.push(`/${d.row.table}/${d.row.variable}`)
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default VariableTable
