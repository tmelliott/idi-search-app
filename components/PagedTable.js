import React, { useRef } from "react"
import { useEffect } from "react"
import { useState } from "react"
import Link from "next/link"

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/outline"
import { Input } from "@material-ui/core"

// table with pagination if items.length > n
function PagedTable({ cols, rows, n, rowHandler = () => {}, moreUrl, lazy }) {
  const limit = n || rows.length
  const [viewSet, setViewSet] = useState([])

  const [page, setPage] = useState(lazy ? lazy.page : 0)
  const total = lazy ? lazy.n : rows.length
  const nPage = Math.ceil(total / limit)

  const goRef = useRef()

  useEffect(() => {
    if (lazy) {
      lazy.setPage(page)
      return
    }
    if (page > nPage - 1) {
      setPage(nPage - 1)
      return
    }
    setViewSet(rows.slice(limit * page, limit * page + limit))
  }, [page])

  useEffect(() => {
    if (rows.length === 0) return
    if (lazy) setViewSet(rows)
    else setViewSet(rows.slice(limit * page, limit * page + limit))
  }, [rows])

  const iconClass =
    "inline-block px-1 py-1 h-5 mx-1 bg-gray-800 text-white rounded-full cursor-pointer hover:bg-gray-900"

  const makeRows = (x, N) => {
    let rows = []
    let i = x
    while (i < N) {
      rows = rows.concat([{ id: i }])
      i++
    }
    return rows
  }

  return (
    <div className="app-table">
      <table>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.name}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {viewSet.length > 0 ? (
            viewSet.map((r) => (
              <tr
                key={r.id}
                className={`clickable ${
                  lazy &&
                  lazy.loading &&
                  "text-gray-200 pointer-events-none cursor-not-allowed"
                }`}
                onClick={() => rowHandler(r)}
              >
                {cols.map((c) => (
                  <td key={c.name}>{c.value ? c.value(r) : r[c.name]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td>No results to show</td>
            </tr>
          )}
          {/* if number of items on this page is less than n, pad table */}
          {viewSet.length > 0 &&
            viewSet.length < limit &&
            makeRows(viewSet.length, limit).map((r) => (
              <tr key={r.id} className="clickable cursor-default">
                {cols.map((c) => (
                  <td key={c.name} className="opacity-0 pointer-events-none">
                    {c.value ? c.value(viewSet[0]) : "-"}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {limit < total && (
        <div className="flex items-center bg-gray-100 rounded-full py-1">
          <ChevronDoubleLeftIcon
            className={iconClass + (page === 0 ? " opacity-0" : "")}
            onClick={() => setPage(0)}
          />
          <ChevronLeftIcon
            className={iconClass + (page === 0 ? " opacity-0" : "")}
            onClick={() => setPage(Math.max(0, page - 1))}
          />
          <div className="px-2 flex-1 text-center text-xs flex items-center justify-center">
            Page {page + 1} of {nPage}
            {moreUrl && (
              <Link href={moreUrl}>
                <a className="mx-2 text-blue-500 italic">View more</a>
              </Link>
            )}
            <div className="w-5"></div>
            Jump to page
            <div className="w-2"></div>
            <Input
              defaultValue={""}
              size="small"
              inputRef={goRef}
              className="w-10"
            />
            <div
              className="bg-gray-200 p-1 px-2 ml-2 text-xs rounded cursor-pointer hover:bg-gray-300"
              onClick={() => {
                if (goRef.current === undefined) return
                const to = parseInt(goRef.current.value)
                if (isNaN(to)) return
                setPage(Math.min(nPage - 1, Math.max(0, to)))
                goRef.current.value = ""
              }}
            >
              Go
            </div>
          </div>
          <ChevronRightIcon
            className={iconClass + (page === nPage - 1 ? " opacity-0" : "")}
            onClick={() => setPage(Math.min(page + 1, nPage - 1))}
          />
          <ChevronDoubleRightIcon
            className={iconClass + (page === nPage - 1 ? " opacity-0" : "")}
            onClick={() => setPage(nPage - 1)}
          />
        </div>
      )}
    </div>
  )
}

export default PagedTable
