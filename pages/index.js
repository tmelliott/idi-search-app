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

export default function Home({
  allAgencies,
  allCollections,
  allDatasets,
  n_variables,
  filterTerm,
  setFilterTerm,
}) {
  const [agencies, setAgencies] = useState(allAgencies)
  const [collections, setCollections] = useState(allCollections)
  const [datasets, setDatasets] = useState(allDatasets)

  const [loading, setLoading] = useState(false)

  // the container to display information
  const [info, setInfo] = useState(false)
  const displayRef = useRef()
  const renderInfo = (x) => {
    if (x === null) {
      setInfo(false)
      unmountComponentAtNode(displayRef.current)
      return
    }
    render(x, displayRef.current)
    setInfo(true)
  }

  useEffect(async () => {
    if (filterTerm === "") {
      setAgencies(allAgencies)
      setCollections(allCollections)
      setDatasets(allDatasets)
    } else {
      setLoading(true)
      setAgencies([])
      setCollections([])
      setDatasets([])
      const newAgencies = await fetch(`/api/agencies?q=${filterTerm}`)
      const newCollections = await fetch(`/api/collections?q=${filterTerm}`)
      const newDatasets = await fetch(`/api/datasets?q=${filterTerm}`)
      setAgencies(await newAgencies.json())
      setCollections(await newCollections.json())
      setDatasets(await newDatasets.json())
    }
    setLoading(false)
  }, [filterTerm])

  return (
    <div className="h-full">
      <Head>
        <title>What's in the IDI?</title>
      </Head>

      {/* New: display expandable groups for various components... */}
      {/* each filtered by a search term, if possible */}

      <div className="md:h-full flex md:overflow-x-hidden">
        <div className="flex-1 overflow-y-scroll">
          <Search
            term={filterTerm}
            handler={setFilterTerm}
            disabled={loading}
          />
          <Agencies agencies={agencies} action={renderInfo} loading={loading} />
          <Collections
            collections={collections}
            action={renderInfo}
            loading={loading}
          />
          <Datasets datasets={datasets} action={renderInfo} loading={loading} />

          <section>
            <h2>Variables ({n_variables})</h2>
          </section>
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

      {/* OLD STUFF:: */}
      {/* <div className="h-full flex">
        <div className="h-full vartable-container">
          <VariableTable
            filterTerm={filterTerm}
            setFilterTerm={setFilterTerm}
          />
        </div>

        <div>variable information goes here</div>
      </div> */}
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
      n_variables: variables.length,
    },
  }
}
