// return info about a single variable in a dataset

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(d_id, v_id) {
  const variable = await prisma.variables.findUnique({
    where: {
      v_id: {
        dataset_id: d_id,
        variable_id: v_id,
      },
    },
    include: {
      dataset: {
        select: {
          dataset_id: true,
          dataset_name: true,
          collection: {
            select: {
              collection_id: true,
              collection_name: true,
              agency: {
                select: {
                  agency_id: true,
                  agency_name: true,
                },
              },
            },
          },
          alternate: {
            select: {
              match: true,
            },
          },
          matches: {
            select: {
              table: true,
            },
          },
        },
      },
      alternate: {
        select: {
          match: true,
        },
      },
      matches: {
        select: {
          variable: true,
        },
      },
    },
  })
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
  if (!variable) return null

  let refreshes = variable.refreshes || null
  if (refreshes && refreshes.length) {
    refreshes = current_refreshes.map((r) => ({
      refresh: r,
      available: refreshes.match(r) !== null,
    }))
  } else {
    refreshes = null
  }

  const { matches, alternate, dataset, ...vble } = variable
  const { matches: tmatch, alternate: talt, ...tbl } = variable.dataset

  return {
    ...vble,
    dataset: {
      ...tbl,
      matches: tmatch.map((m) => m.table).concat(talt.map((a) => a.match)),
    },
    matches: matches
      .map((m) => m.variable)
      .concat(alternate.map((a) => a.match)),
    database: variable.refreshes
      ? variable.refreshes.match("Adhoc|RnD|Metadata")
        ? variable.refreshes
        : "IDI Clean"
      : null,
    refreshes: refreshes,
  }
}

export default async function collectionAPI(req, res) {
  const { dataset_id, variable_id } = req.query
  const variable = await main(dataset_id, variable_id)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  if (variable) res.status(200).json(variable)
  res.status(400).end()
}
