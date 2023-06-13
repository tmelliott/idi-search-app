import { type InferGetStaticPropsType } from "next";
import Head from "next/head";

import dayjs from "dayjs";
import { prisma } from "~/server/db";

export const getStaticProps = async () => {
  const variables = await prisma.variables.findMany({
    select: {
      refreshes: true,
      description: true,
      dataset_id: true,
    },
  });

  const dbs = new Map<
    string,
    { count: number; meta: number; datasets: string[] }
  >();

  const tally = (db: string, hasMeta: boolean, ds: string) => {
    // if (dbs.has(db))
    dbs.set(db, {
      count: (dbs.get(db)?.count || 0) + 1,
      meta: (dbs.get(db)?.meta || 0) + (hasMeta ? 1 : 0),
      datasets: [...[...(dbs.get(db)?.datasets || [])], ds],
    });
    // else dbs.set(db, { count: 1, meta: hasMeta ? 1 : 0, datasets: [ds] });
  };

  variables.map((v) => {
    if (!v.refreshes) {
      tally("Unknown", v.description !== null, "Unknown");
      return;
    }
    v.refreshes
      .split(",")
      .map((d) => tally(d, v.description !== null, v.dataset_id));
  });

  const variableStats = [...dbs.keys()].sort().map((k) => ({
    name: k,
    variables: dbs.get(k)?.count || 0,
    withMetadata: dbs.get(k)?.meta || 0,
  }));

  let databaseDbs = [...dbs.keys()].sort().map((k) => ({
    k,
    ds: dbs
      .get(k)
      ?.datasets.filter((x, i): number =>
        dbs.get(k)?.datasets.indexOf(x) === i ? 1 : 0
      ),
    withMeta: 0,
  }));

  const datasets = await prisma.datasets.findMany({
    select: {
      dataset_id: true,
      description: true,
    },
  });

  datasets.map((ds) => {
    const hasMeta = ds.description === null ? 0 : 1;
    databaseDbs = databaseDbs.map((db) => {
      if (!db.ds?.includes(ds.dataset_id)) return db;
      return {
        k: db.k,
        ds: db.ds,
        withMeta: db.withMeta + hasMeta,
      };
    });
  });

  const dbStats = databaseDbs.map((d) => ({
    name: d.k,
    datasets: d.ds?.length || 0,
    withMetadata: d.withMeta,
  }));

  return {
    props: {
      variableStats,
      dbStats,
    },
  };
};

const StatsPage = ({
  variableStats,
  dbStats,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  let maxN = 0;
  let maxM = 0;
  variableStats.map((s) => (maxN = Math.max(maxN, s.variables)));
  dbStats.map((s) => (maxM = Math.max(maxM, s.datasets)));

  return (
    <div className="prose prose-sm prose-blue mx-auto">
      <Head>
        <title>Quick Stats | IDI Search</title>
      </Head>

      <section>
        <h2>Basic Stats from the IDI</h2>
        <p>
          Here is some basic information about the counts of variables and
          datasets in the IDI, and what proportion of them have metadata
          currently available in our app.
        </p>

        <p>
          The grey bars show the number of variables or datasets available from
          each refresh, and in the latest Adhoc database. The blue bar
          represents how many have metadata available, which is shown as a
          percentage in brackets.
        </p>
      </section>

      <section>
        <h4 className="">Variables</h4>

        <div className="w-[80%] flex flex-col gap-2">
          {variableStats.map((stat) => (
            <div
              key={stat.name}
              className={`flex h-[20px] items-center gap-2 ${
                stat.name === "Adhoc" ? "mt-4" : ""
              }`}
            >
              <div className="flex-1 text-right">
                {isNaN(parseInt(stat.name))
                  ? stat.name
                  : dayjs(stat.name, "YYYYMMDD").format("MMM YYYY") +
                    " refresh"}
              </div>
              <div className="h-full w-2/3 flex ">
                <div
                  className="h-full bg-gray-300 relative"
                  style={{
                    width: `${Math.round((stat.variables / maxN) * 100)}%`,
                  }}
                >
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-blue-600"
                    style={{
                      width: `${Math.round(
                        (stat.withMetadata / stat.variables) * 100
                      )}%`,
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
        <h4 className="">Datasets</h4>

        <div className="w-[80%] flex flex-col gap-2">
          {dbStats.map((stat) => (
            <div
              key={stat.name}
              className={`flex h-[20px] items-center gap-2 ${
                stat.name === "Adhoc" ? "mt-4" : ""
              }`}
            >
              <div className="flex-1 text-right">
                {isNaN(parseInt(stat.name))
                  ? stat.name
                  : dayjs(stat.name, "YYYYMMDD").format("MMM YYYY") +
                    " refresh"}
              </div>
              <div className="h-full w-2/3 flex">
                <div
                  className="h-full bg-gray-300 relative"
                  style={{
                    width: `${Math.round((stat.datasets / maxM) * 100)}%`,
                  }}
                >
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-blue-600"
                    style={{
                      width: `${Math.round(
                        (stat.withMetadata / stat.datasets) * 100
                      )}%`,
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
  );
};

export default StatsPage;
