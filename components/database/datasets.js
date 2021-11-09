import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(query) {
  let args = {
    select: {
      dataset_id: true,
      dataset_name: true,
      collection_id: true,
      description: true,
      collection: {
        select: {
          agency: {
            select: {
              agency_name: true,
            },
          },
        },
      },
    },
  }
  if (query !== undefined) {
    args = {
      ...args,
      where: {
        OR: [
          { dataset_name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    }
  }
  const datasets = await prisma.datasets.findMany(args)
  return datasets
}

export default async function getDatasets(query) {
  const datasets = await main(query)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  return datasets
}
