import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(query) {
  let args = {
    select: {
      variable_id: true,
      dataset_id: true,
      refreshes: true,
    },
  }
  if (query !== undefined) {
    args = {
      ...args,
      where: {
        OR: [
          { variable_id: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    }
  }
  const variables = await prisma.variables.findMany(args)
  return variables
}

export default async function getVariables(query) {
  const variables = await main(query)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  return variables
}
