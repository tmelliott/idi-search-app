import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import Link from "next/link"

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/outline"

// table with pagination if items.length > n
function PagedTable({ cols, rows, n, rowHandler = () => {}, moreUrl }) {
  const limit = n || rows.length
  const [viewSet, setViewSet] = useState([])

  const [page, setPage] = useState(0)
  const nPage = Math.ceil(rows.length / limit)

  useEffect(() => {
    if (page > nPage - 1) {
      setPage(nPage - 1)
      return
    }
    setViewSet(rows.slice(limit * page, limit * page + limit))
  }, [rows, page])

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
                className="clickable"
                onClick={() => rowHandler(r)}
              >
                {cols.map((c) => (
                  <td key={c.name}>{c.value ? c.value(r) : r[c.name]}</td>
                ))}
              </tr>
            ))
          ) : (
            <p>No results to show.</p>
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
      {limit < rows.length && (
        <div className="flex items-center bg-gray-100 rounded-full py-1">
          <ChevronDoubleLeftIcon
            className={iconClass + (page === 0 ? " opacity-0" : "")}
            onClick={() => setPage(0)}
          />
          <ChevronLeftIcon
            className={iconClass + (page === 0 ? " opacity-0" : "")}
            onClick={() => setPage(Math.max(0, page - 1))}
          />
          <div className="px-2 flex-1 text-center text-xs">
            Page {page + 1} of {nPage}
            {moreUrl && (
              <Link href={moreUrl}>
                <a className="mx-2 text-blue-500 italic">View more</a>
              </Link>
            )}
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
