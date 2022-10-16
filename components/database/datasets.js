import { prisma } from "../../lib/db"

async function main(query, collectionId) {
  let args = {
    select: {
      dataset_id: true,
      dataset_name: true,
      collection_id: true,
      description: true,
      collection: {
        select: {
          collection_name: true,
          agency: {
            select: {
              agency_name: true,
            },
          },
        },
      },
    },
    orderBy: [{ dataset_name: "asc" }],
  }
  if (query !== undefined && query !== "") {
    const searchTerms = query
      .split(" ")
      .map((x) => (x.length ? "+" + x : x))
      .join(" ")
      .replace("_", "\\_")
    args = {
      ...args,
      where: {
        OR: [
          {
            AND: [
              { dataset_id: { search: searchTerms } },
              { dataset_name: { search: searchTerms } },
              { description: { search: searchTerms } },
            ],
          },
          { dataset_id: { contains: query } },
        ],
      },
    }
  }
  if (collectionId !== "") {
    args = {
      ...args,
      where: {
        ...(args.where || null),
        collection_id: collectionId,
      },
    }
  }
  const datasets = await prisma.datasets.findMany(args)
  return datasets
}

export default async function getDatasets(query, collectionId) {
  const datasets = await main(query, collectionId)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  return datasets
}
