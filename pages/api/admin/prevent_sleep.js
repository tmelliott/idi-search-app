import { prisma } from "../../../lib/db"

// This API end point can be called to trigger a write-and-read of the database,
// preventing it from going to sleep!
export default async function preventSleep(req, res) {
  res.setHeader("Cache-Control", "s-maxage=604800")
  const query = req.query.q
  const newAgency = await prisma.agencies.create({
    data: {
      agency_id: "test",
      agency_name: "Test Agency",
    },
  })
  console.log("Created: ", newAgency)
  const dropAgency = await prisma.agencies.delete({
    where: {
      agency_id: "test",
    },
  })
  console.log("Deleted: ", dropAgency)
  res.status(200).json("OK - database stimulated successfully!")
}
