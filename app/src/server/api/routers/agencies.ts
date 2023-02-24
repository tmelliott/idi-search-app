import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const agenciesRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        term: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(({ ctx, input }) => {
      const where = input.term ? { agency_name: { contains: input.term } } : {};

      return ctx.prisma.agencies.findMany({
        where: where,
        take: input.limit,
      });
    }),
});
