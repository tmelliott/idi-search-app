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
          table_id: true,
          alt_variable_id: true,
        },
      },
      matches: {
        select: {
          table_id: true,
          variable_id: true,
        },
      },
      // alternate: {
      //   select: {
      //     variable: true,
      //   },
      // },
      // matches: {
      //   select: {
      //     match: true,
      //   },
      // },
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
    "202210",
  ]

  if (!variable) return {}

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
      // .map((m) => m.match)
      .concat(
        alternate.map((a) => ({
          table_id: a.table_id,
          variable_id: a.alt_variable_id,
        }))
      ),
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
