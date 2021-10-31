import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const allTables = await prisma.table.findMany({
    select: {
      name: true,
      collection: true,
    },
  })
  return allTables
}

// API to list all available tables
export default async function tablesAPI(req, res) {
  const tables = await main()
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  res.status(200).json(tables)
}
