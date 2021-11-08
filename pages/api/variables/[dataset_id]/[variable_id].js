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
        },
      },
    },
  })
  const current_refreshes = ["20200120", "20200720", "20201020", "20210420"]
  let refreshes = variable.refreshes
  if (refreshes && refreshes.length) {
    refreshes = current_refreshes.map((r) => ({
      refresh: r,
      available: refreshes.match(r) !== null,
    }))
  } else {
    refreshes = null
  }

  return {
    ...variable,
    database: variable.refreshes
      ? variable.refreshes.match("Adhoc")
        ? "Adhoc"
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

  res.status(200).json(variable)
}
