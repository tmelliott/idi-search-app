import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const agenciesRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        term: z.string().optional(),
        limit: z.number().optional(),
        exact: z.boolean().optional(),
      })
    )
    .query(({ ctx, input }) => {
      let where: Prisma.agenciesFindManyArgs["where"] = {};

      if (input.term)
        where = {
          OR: [
            {
              agency_name: input.exact
                ? { contains: input.term }
                : { search: input.term },
            },
            { agency_id: { contains: input.term } },
          ],
        };

      return ctx.prisma.agencies.findMany({
        where: where,
        take: input.limit,
      });
    }),
  get: publicProcedure
    .input(
      z.object({
        agency_id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.agencies.findUnique({
        where: { agency_id: input.agency_id },
      });
    }),
});
