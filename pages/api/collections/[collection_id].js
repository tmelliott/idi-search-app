// return info about a single collection, and its variables

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(id) {
  const collection = await prisma.collections.findUnique({
    where: {
      collection_id: id,
    },
    include: {
      datasets: {
        select: {
          dataset_id: true,
          dataset_name: true,
        },
      },
      agency: true,
    },
  })
  return collection
}

export default async function collectionAPI(req, res) {
  const { collection_id } = req.query
  const agency = await main(collection_id)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  res.status(200).json(agency)
}
