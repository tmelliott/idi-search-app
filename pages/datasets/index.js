import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Head from "next/head"

import Datasets from "../../components/Datasets"
import Search from "../../components/Search"
import { ArrowCircleLeftIcon, XCircleIcon } from "@heroicons/react/outline"
import { render, unmountComponentAtNode } from "react-dom"

// a list of datasets
export default function DatasetsPage({ filterTerm, setFilterTerm }) {
  // the container to display information
  const [info, setInfo] = useState(false)
  const displayRef = useRef()
  const [toRender, setToRender] = useState(null)
  const renderInfo = (x) => {
    setToRender(x)
    if (x === null) {
      setInfo(false)
      unmountComponentAtNode(displayRef.current)
      return
    }
    render(
      { ...x, props: { ...x.props, highlight: filterTerm } },
      displayRef.current
    )
    setInfo(true)
  }
  useEffect(() => {
    renderInfo(toRender)
  }, [filterTerm])

  return (
    <div className="h-full">
      <Head>
        <title>Datasets | IDI Search</title>
      </Head>

      <div className="md:h-full flex md:overflow-x-hidden">
        <div className="flex-1 overflow-y-scroll">
          <div className="inline-block">
            <Link href="/">
              <a className="flex gap-1 items-center mb-1 text-xs cursor-pointer">
                <ArrowCircleLeftIcon className="h-4" /> Back
              </a>
            </Link>
          </div>
          <Search term={filterTerm} handler={setFilterTerm} />
          <Datasets action={renderInfo} term={filterTerm} />
        </div>

        <div
          className={`flex-1 p-4 shadow-md bg-gray-50 overflow-x-hidden ${
            info ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
          } transition fixed top-0 left-0 w-full md:overflow-y-scroll scrollbar-hide md:scrollbar-default
          h-full pt-4 md:static md:w-auto md:h-full md:top-auto md:left-auto`}
        >
          <div className="flex flex-row justify-end">
            <div
              className="flex flex-row text-xs items-center cursor-pointer hover:opacity-70"
              onClick={() => renderInfo(null)}
            >
              Close
              <XCircleIcon className="h-6 ml-2" />
            </div>
          </div>
          <div ref={displayRef}></div>
        </div>
      </div>
    </div>
  )
}
