import { prisma } from "~/server/db";

const currentRefreshes = async () => {
  const refreshes = await prisma.variables.findMany({
    select: {
      refreshes: true,
    },
  });

  const current_refreshes = refreshes
    .map((v) => v.refreshes?.split(","))
    .flat()
    // unique values
    .filter((v, i, a) => a.indexOf(v) === i)
    // remove non-string values
    .filter((v): v is string => !!v)
    // remove Adhoc
    .filter((v) => v !== "Adhoc");

  return current_refreshes;
};

export default currentRefreshes;
