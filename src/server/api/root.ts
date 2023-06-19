import { createTRPCRouter } from "~/server/api/trpc";

import { agenciesRouter } from "./routers/agencies";
import { collectionsRouter } from "./routers/collections";
import { datasetsRouter } from "./routers/datasets";
import { dbInfoRouter } from "./routers/db_info";
import { variablesRouter } from "./routers/variables";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  agencies: agenciesRouter,
  collections: collectionsRouter,
  datasets: datasetsRouter,
  variables: variablesRouter,
  db_info: dbInfoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
