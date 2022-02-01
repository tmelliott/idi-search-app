import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main(query, datasetId) {
  let args = {
    select: {
      variable_id: true,
      variable_name: true,
      dataset_id: true,
      dataset: {
        select: {
          dataset_name: true,
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
      },
    },
  }
  if (query !== undefined && query !== "") {
    args = {
      ...args,
      where: {
        OR: [
          { variable_id: { contains: query } },
          { description: { contains: query } },
        ],
        NOT: {
          description: null,
        },
      },
    }
  }
  if (datasetId !== "") {
    args = {
      ...args,
      where: {
        ...(args.where || null),
        dataset_id: datasetId,
      },
    }
  }
  const variables = await prisma.variables.findMany(args)
  return variables.map((v) => ({
    ...v,
    v_id: v.variable_id + "_" + v.dataset_id,
  }))
}

export default async function getVariables(query, datasetId) {
  const variables = await main(query, datasetId)
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  return variables
}
