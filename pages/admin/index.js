import React from "react"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function AdminHome({ varCount, datasetCount, lonelyDatasetCount }) {
  return (
    <div>
      <div className="prose prose-sm">
        <h1>App adminstration information.</h1>

        <p>
          Note this page is not supposed to be secure, but is here to provide
          administrators with some information most users might not care for.
        </p>

        <hr />
      </div>

      <div className="prose">
        <dl>
          <dt>Number of variables:</dt>
          <dd>{varCount}</dd>
        </dl>
        <dl>
          <dt>Number of datasets:</dt>
          <dd>{datasetCount}</dd>
        </dl>
        <dl>
          <dt>Datasets missing collections:</dt>
          <dd>{lonelyDatasetCount}</dd>
        </dl>
      </div>
    </div>
  )
}

export default AdminHome

async function getStats() {
  const varCount = await prisma.variables.count()
  const datasetCount = await prisma.datasets.count()
  const lonelyDatasetCount = await prisma.datasets.count({
    where: {
      collection_id: null,
    },
  })

  // variables not in all refreshes:
  const varRefresh = await prisma.variables.findMany({
    select: {
      variable_id: true,
      refreshes: true,
    },
  })

  return {
    varCount,
    datasetCount,
    lonelyDatasetCount,
  }
}

export async function getStaticProps(context) {
  const stats = await getStats()
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  console.log(stats)

  return {
    props: {
      ...stats,
    },
  }
}
