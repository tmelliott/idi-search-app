import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(query) {
  let args = {}
  if (query !== undefined) {
    args = {
      ...args,
      where: {
        OR: [
          { agency_id: { contains: query, mode: "insensitive" } },
          { agency_name: { contains: query, mode: "insensitive" } },
        ],
      },
    }
  }
  const agencies = await prisma.agencies.findMany(args)
  return agencies
}

export default async function agenciesAPI(req, res) {
  const query = req.query.q
  const agencies = await main(query)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  res.status(200).json(agencies)
}
