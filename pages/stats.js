import moment from "moment"
import Head from "next/head"
import { prisma } from "../lib/db"

export const getStaticProps = async () => {
  const variables = await prisma.variables.findMany({
    select: {
      refreshes: true,
      description: true,
      dataset_id: true,
    },
  })

  const dbs = new Map()
  const tally = (db, hasMeta, ds) => {
    if (dbs.has(db))
      dbs.set(db, [
        dbs.get(db)[0] + 1,
        dbs.get(db)[1] + (hasMeta ? 1 : 0),
        [...dbs.get(db)[2], ds],
      ])
    else dbs.set(db, [1, hasMeta ? 1 : 0, [ds]])
  }

  variables.map((v) => {
    if (!v.refreshes) {
      tally("Unknown", v.description !== null)
      return
    }
    v.refreshes
      .split(",")
      .map((d) => tally(d, v.description !== null, v.dataset_id))
  })

  const variableStats = [...dbs.keys()].sort().map((k) => ({
    name: k,
    variables: dbs.get(k)[0],
    withMetadata: dbs.get(k)[1],
  }))

  let databaseDbs = [...dbs.keys()].sort().map((k) => ({
    k,
    ds: dbs.get(k)[2].filter((x, i) => dbs.get(k)[2].indexOf(x) === i),
    withMeta: 0,
  }))

  const datasets = await prisma.datasets.findMany({
    select: {
      dataset_id: true,
      description: true,
    },
  })

  datasets.map((ds) => {
    const hasMeta = ds.description === null ? 0 : 1
    databaseDbs = databaseDbs.map((db) => {
      if (!db.ds.includes(ds.dataset_id)) return db
      return {
        k: db.k,
        ds: db.ds,
        withMeta: db.withMeta + hasMeta,
      }
    })
  })

  const dbStats = databaseDbs.map((d) => ({
    name: d.k,
    datasets: d.ds.length,
    withMetadata: d.withMeta,
  }))

  return {
    props: {
      variableStats,
      dbStats,
    },
  }
}

const StatsPage = ({ variableStats, dbStats }) => {
  let maxN = 0
  let maxM = 0
  variableStats.map((s) => (maxN = Math.max(maxN, s.variables)))
  dbStats.map((s) => (maxM = Math.max(maxM, s.datasets)))

  return (
    <div className="prose prose-sm prose-blue mx-auto">
      <Head>
        <title>Quick Stats | IDI Search</title>
      </Head>

      <section>
        <h2>Basic Stats from the IDI</h2>
        <p>
          Here is some basic information about the counts of variables in the
          IDI, and what proportion of them have metadata currently available in
          our app.
        </p>
      </section>

      <section>
        <h4 className="">Variables in the IDI by database</h4>

        <p>
          The percentage of variables in each database with metadata available
          (darker blue) is shown in brackets.
        </p>

        <div className="w-[80%] flex flex-col gap-2">
          {variableStats.map((stat) => (
            <div
              key={stat.name}
              className={`flex h-[20px] items-center gap-2 ${
                stat.name === "Adhoc" && "mt-4"
              }`}
            >
              <div className="flex-1 text-right">
                {isNaN(parseInt(stat.name))
                  ? stat.name
                  : moment(stat.name, "YYYYMMDD").format("MMMM YYYY")}
              </div>
              <div className="h-full w-3/4 flex">
                <div
                  className="h-full bg-blue-500 relative"
                  style={{
                    width: Math.round((stat.variables / maxN) * 100) + "%",
                  }}
                >
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-blue-600"
                    style={{
                      width:
                        Math.round((stat.withMetadata / stat.variables) * 100) +
                        "%",
                    }}
                  ></div>
                  <div className="absolute top-0 bottom-0 right-0 pl-1 translate-x-full flex text-xs font-bold items-center ml-1 z-50 w-[100px]">
                    {stat.variables} (
                    {Math.round((stat.withMetadata / stat.variables) * 100)}%)
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="">Datasets in the IDI by database</h4>

        <p>
          The percentage of datasets in each database with metadata available
          (darker blue) is shown in brackets.
        </p>

        <div className="w-[80%] flex flex-col gap-2">
          {dbStats.map((stat) => (
            <div
              key={stat.name}
              className={`flex h-[20px] items-center gap-2 ${
                stat.name === "Adhoc" && "mt-4"
              }`}
            >
              <div className="flex-1 text-right">
                {isNaN(parseInt(stat.name))
                  ? stat.name
                  : moment(stat.name, "YYYYMMDD").format("MMMM YYYY")}
              </div>
              <div className="h-full w-3/4 flex">
                <div
                  className="h-full bg-blue-500 relative"
                  style={{
                    width: Math.round((stat.datasets / maxM) * 100) + "%",
                  }}
                >
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-blue-600"
                    style={{
                      width:
                        Math.round((stat.withMetadata / stat.datasets) * 100) +
                        "%",
                    }}
                  ></div>
                  <div className="absolute top-0 bottom-0 right-0 pl-1 translate-x-full flex text-xs font-bold items-center ml-1 z-50 w-[100px]">
                    {stat.datasets} (
                    {Math.round((stat.withMetadata / stat.datasets) * 100)}%)
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default StatsPage
