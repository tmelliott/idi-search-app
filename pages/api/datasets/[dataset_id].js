// return info about a single dataset, and its variables

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(id) {
  const dataset = await prisma.datasets.findUnique({
    where: {
      dataset_id: id,
    },
    include: {
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
      variables: {
        select: {
          variable_id: true,
          variable_name: true,
          dataset_id: true,
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
  })

  const { matches, alternate, ...ds } = dataset
  return {
    ...ds,
    matches: matches.map((m) => m.table).concat(alternate.map((a) => a.match)),
  }
}

export default async function collectionAPI(req, res) {
  const { dataset_id } = req.query
  const dataset = await main(dataset_id)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  res.status(200).json(dataset)
}
