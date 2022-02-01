import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/outline"
import React from "react"

function Paginator({ pagination, handler }) {
  const { page, nPerPage, nPage } = pagination
  //   const size =
  const iconClass =
    "inline-block px-1 py-1 h-5 mx-1 bg-gray-800 text-white rounded-full"

  const toStart = () => {
    if (page === 0) return
    handler({
      ...pagination,
      page: 0,
    })
  }
  const goBack = () => {
    if (page === 0) return
    handler({
      ...pagination,
      page: page - 1,
    })
  }
  const goForward = () => {
    if (page === nPage - 1) return
    handler({
      ...pagination,
      page: page + 1,
    })
  }
  const toEnd = () => {
    if (page === nPage - 1) return
    handler({
      ...pagination,
      page: nPage - 1,
    })
  }

  return (
    <div className="text-xs text-right flex items-center justify-end">
      <ChevronDoubleLeftIcon className={iconClass} onClick={toStart} />
      <ChevronLeftIcon className={iconClass} onClick={goBack} />
      <div className="px-2">
        Page {page + 1} of {nPage}
      </div>
      <ChevronRightIcon className={iconClass} onClick={goForward} />
      <ChevronDoubleRightIcon className={iconClass} onClick={toEnd} />
    </div>
  )
}

export default Paginator
