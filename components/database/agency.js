// return info about a single agency, and it's collections
import { prisma } from "../../lib/db"

async function main(id) {
  const agency = await prisma.agencies.findUnique({
    where: {
      agency_id: id,
    },
  })
  return agency
}

export default async function getAgency(agency_id) {
  const agency = await main(agency_id)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  return agency
}
