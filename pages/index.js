import Head from "next/head"
import { useRef, useState } from "react"
import { render } from "react-dom"
import Agencies from "../components/Agencies"
import Collections from "../components/Collections"

import getAgencies from "../components/database/agencies"
import getCollections from "../components/database/collections"
import getDatasets from "../components/database/datasets"
import getVariables from "../components/database/variables"
import { XCircleIcon } from "@heroicons/react/outline"
import Datasets from "../components/Datasets"

export default function Home({
  agencies,
  collections,
  datasets,
  n_variables,
  filterTerm,
  setFilterTerm,
}) {
  // the container to display information
  const [info, setInfo] = useState(false)
  const displayRef = useRef()
  const renderInfo = (x) => {
    if (x === null) {
      setInfo(false)
      displayRef.current.innerHTML = ""
      return
    }
    render(x, displayRef.current)
    setInfo(true)
  }

  return (
    <div className="h-full">
      <Head>
        <title>What's in the IDI?</title>
      </Head>

      {/* New: display expandable groups for various components... */}
      {/* each filtered by a search term, if possible */}

      <div className="h-full flex">
        <div className="flex-1">
          <Agencies agencies={agencies} action={renderInfo} />
          <Collections collections={collections} action={renderInfo} />
          <Datasets datasets={datasets} action={renderInfo} />

          <section>
            <h2>Variables ({n_variables})</h2>
          </section>
        </div>

        <div
          className={`flex-1 p-4 shadow-md bg-gray-50 ${
            info ? "opacity-100" : "opacity-0"
          } transition overflow-scroll`}
        >
          <XCircleIcon
            className="h-6 fixed right-0 mr-10 cursor-pointer"
            onClick={() => renderInfo(null)}
          />
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
      agencies,
      collections,
      datasets,
      n_variables: variables.length,
    },
  }
}
