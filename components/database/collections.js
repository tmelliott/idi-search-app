import { prisma } from "../../lib/db"

async function main(query, agencyId) {
  let args = {
    select: {
      collection_id: true,
      collection_name: true,
      description: true,
      agency: {
        select: {
          agency_name: true,
        },
      },
    },
    orderBy: [{ collection_name: "asc" }],
  }
  if (query !== undefined && query !== "") {
    const searchTerms = query
      .split(" ")
      .map((x) => "+" + x)
      .join(" ")
    args = {
      ...args,
      where: {
        OR: [
          { collection_id: { search: searchTerms } },
          { collection_name: { search: searchTerms } },
          { description: { search: searchTerms } },
        ],
      },
    }
  }
  if (agencyId !== "") {
    args = {
      ...args,
      where: {
        ...(args.where || null),
        agency_id: agencyId,
      },
    }
  }
  const collections = await prisma.collections.findMany(args)
  return collections
}

export default async function getCollections(query, agencyId) {
  const collections = await main(query, agencyId)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  return collections
}
