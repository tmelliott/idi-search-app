import { prisma } from "../../lib/db"

// count the number of datasets with this variable
export default async function linksAPI(req, res) {
  res.setHeader("Cache-Control", "s-maxage=604800")
  const { variable_id, dataset_id } = req.query

  const links = await prisma.variables.findMany({
    where: {
      variable_id: variable_id,
      NOT: {
        dataset_id: dataset_id,
      },
    },
    select: {
      dataset: {
        select: {
          dataset_id: true,
          dataset_name: true,
        },
      },
    },
  })

  res.status(200).json(links)
}
