import Head from "next/head"
import Link from "next/link"
import Collections from "../components/Collections"

import getAgencies from "../components/database/agencies"
import getCollections from "../components/database/collections"
import getDatasets from "../components/database/datasets"
import getVariables from "../components/database/variables"

export default function Home({
  agencies,
  collections,
  datasets,
  n_variables,
  filterTerm,
  setFilterTerm,
}) {
  return (
    <div className="h-full">
      <Head>
        <title>What's in the IDI?</title>
      </Head>

      {/* New: display expandable groups for various components... */}
      {/* each filtered by a search term, if possible */}

      <section>
        <h2>Agencies ({agencies.length})</h2>
        <ul>
          {agencies.map((agency) => (
            <li key={agency.agency_id}>
              <Link
                href={{
                  pathname: "/agencies/[agency_id]",
                  query: { agency_id: agency.agency_id },
                }}
              >
                <a>{agency.agency_name}</a>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Collections collections={collections} />

      <section>
        <h2>Datasets ({datasets.length})</h2>
        <ul>
          {datasets.map((dataset) => (
            <li key={dataset.dataset_id}>
              <Link
                href={{
                  pathname: "/datasets/[dataset_id]",
                  query: { dataset_id: dataset.dataset_id },
                }}
              >
                <a>{dataset.dataset_name}</a>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Variables ({n_variables})</h2>
      </section>

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
