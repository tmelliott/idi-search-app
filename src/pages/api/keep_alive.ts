// write to the db to keep it alive
import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // create row
  const row = await prisma.temp.create({
    data: {
      value: "keep alive",
    },
  });

  // delete it again
  await prisma.temp.delete({
    where: {
      id: row.id,
    },
  });

  res.status(200).json({ message: "ok" });
}
