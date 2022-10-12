import { prisma } from "../../lib/db"

async function main(query) {
  let args = {
    orderBy: [{ agency_name: "asc" }],
  }
  if (query !== undefined) {
    const searchTerms = query
      .split(" ")
      .map((x) => "+" + x)
      .join(" ")
    args = {
      ...args,
      where: {
        OR: [
          { agency_id: { search: searchTerms } },
          { agency_name: { search: searchTerms } },
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
