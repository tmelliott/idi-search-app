import { prisma } from "../../lib/db"

async function main(query, include, datasetId, page, size) {
  let args = {
    select: {
      variable_id: true,
      variable_name: true,
      dataset_id: true,
      dataset: {
        select: {
          dataset_name: true,
          collection: {
            select: {
              collection_name: true,
              agency: {
                select: {
                  agency_name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ variable_name: "asc" }],
  }
  if (query !== undefined && query !== "") {
    args = {
      ...args,
      where: {
        OR: [
          { variable_id: { contains: query } },
          { description: { contains: query } },
        ],
        // NOT: {
        //   description: null,
        // },
      },
    }
  }
  if (datasetId !== "") {
    args = {
      ...args,
      where: {
        ...(args.where || null),
        dataset_id: datasetId,
      },
    }
  }

  const current_refreshes = [
    "20200120",
    "20200720",
    "20201020",
    "20210420",
    "20210720",
    "20211020",
    "202203",
    "202206",
  ]

  if (include !== "all") {
    const inc = include.split("_")
    const incs = inc.map((d) => {
      switch (d) {
        case "refreshes":
          return current_refreshes
        case "adhoc":
          return "Adhoc"
        case "meta":
          return "Metadata"
        case "rnd":
          return "RnD"
      }
    })
    const incsWhere = incs.flat().map((inc) => ({
      refreshes: {
        contains: inc,
      },
    }))

    const newwhere = {
      AND: { ...(args.where || null) },
      OR: incsWhere,
    }
    args.where = newwhere
  }

  const { where } = args
  const n = await prisma.variables.count({ where })
  if (n > parseInt(size)) {
    args = {
      ...args,
      take: parseInt(size),
      skip: parseInt(size) * (parseInt(page) - 1),
    }
  }
  const variables = await prisma.variables.findMany({
    ...args,
  })

  return {
    vars: variables.map((v) => ({
      ...v,
      v_id: v.variable_id + "_" + v.dataset_id,
    })),
    n,
  }
}

export default async function getVariables(
  query = "",
  include = "all",
  datasetId = "",
  page = 1,
  size = 10000
) {
  const variables = await main(query, include, datasetId, page, size)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  return variables
}
