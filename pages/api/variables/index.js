import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(n, p) {
  const nskip = n * p
  const allVariables = await prisma.variable.findMany({
    skip: nskip,
    take: n,
    select: {
      name: true,
      table_schema: true,
    },
  })
  return allVariables
}

// API to list all available tables
export default async function variablesAPI(req, res) {
  const p = parseInt(req.query.page) || 0
  const n = parseInt(req.query.results_per_page) || 100

  const variables = await main(n, p)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  res.status(200).json(variables)
}
