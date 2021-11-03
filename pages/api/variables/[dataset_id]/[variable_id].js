// return info about a single variable in a dataset

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(d_id, v_id) {
  const variable = await prisma.variables.findUnique({
    where: {
      variable_id_dataset_id: {
        dataset_id: d_id,
        variable_id: v_id,
      },
    },
    include: {
      dataset: {
        select: {
          dataset_id: true,
          dataset_name: true,
          collection: {
            select: {
              collection_id: true,
              collection_name: true,
              agency: {
                select: {
                  agency_id: true,
                  agency_name: true,
                },
              },
            },
          },
        },
      },
    },
  })
  return variable
}

export default async function collectionAPI(req, res) {
  const { dataset_id, variable_id } = req.query
  const variable = await main(dataset_id, variable_id)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  res.status(200).json(variable)
}
