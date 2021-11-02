// return info about a single agency, and it's collections

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(id) {
  const agency = await prisma.agencies.findUnique({
    where: {
      agency_id: id,
    },
    include: {
      collections: true,
    },
  })
  return agency
}

export default async function agencyAPI(req, res) {
  const { agency_id } = req.query
  const agency = await main(agency_id)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  res.status(200).json(agency)
}
