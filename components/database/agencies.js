import { prisma } from "../../lib/db"

async function main(query) {
  let args = {
    orderBy: [{ agency_name: "asc" }],
  }
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

export default async function getAgencies(query) {
  const agencies = await main(query)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
  return agencies
}
