import Head from "next/head"
import { useEffect, useRef, useState } from "react"
import { render, unmountComponentAtNode } from "react-dom"
import Agencies from "../components/Agencies"
import Collections from "../components/Collections"

import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

import getAgencies from "../components/database/agencies"
import getCollections from "../components/database/collections"
import getDatasets from "../components/database/datasets"
import getVariables from "../components/database/variables"
import { XCircleIcon } from "@heroicons/react/outline"
import Datasets from "../components/Datasets"
import Search from "../components/Search"
import Variables from "../components/Variables"

export default function Home({
  allAgencies,
  allCollections,
  allDatasets,
  filterTerm,
  setFilterTerm,
}) {
  const [agencies] = useState(allAgencies)
  const [collections] = useState(allCollections)
  const [datasets] = useState(allDatasets)
  const [variables] = useState([])

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
        <title>What's in the IDI?</title>
      </Head>

      <div className="md:h-full flex md:overflow-x-hidden">
        <div className="flex-1 overflow-y-scroll">
          <Search term={filterTerm} handler={setFilterTerm} />
          <Agencies
            agencies={agencies}
            action={renderInfo}
            term={filterTerm}
            limit={2}
          />
          <Collections
            collections={collections}
            action={renderInfo}
            term={filterTerm}
            limit={3}
          />
          <Datasets
            datasets={datasets}
            action={renderInfo}
            term={filterTerm}
            limit={5}
          />

          <Variables
            variables={variables}
            action={renderInfo}
            term={filterTerm}
            limit={10}
          />
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

export async function getStaticProps() {
  // get agencies, collections, and datasets, and variable summary
  const agencies = await getAgencies()
  const collections = await getCollections()
  const datasets = await getDatasets()
  const variables = await getVariables()
  return {
    props: {
      allAgencies: agencies,
      allCollections: collections,
      allDatasets: datasets,
    },
  }
}
