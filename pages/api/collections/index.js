import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(query) {
  let args = {
    select: {
      collection_id: true,
      collection_name: true,
    },
  }
  if (query !== undefined) {
    args = {
      ...args,
      where: {
        OR: [
          { collection_name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    }
  }
  const collections = await prisma.collections.findMany(args)
  return collections
}

export default async function collectionsAPI(req, res) {
  const query = req.query.q
  const collections = await main(query)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  res.status(200).json(collections)
}
