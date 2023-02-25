import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const collectionsRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        term: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(({ ctx, input }) => {
      const where = input.term
        ? {
            OR: [
              { collection_name: { contains: input.term } },
              { collection_id: { contains: input.term } },
            ],
          }
        : {};

      return ctx.prisma.collections.findMany({
        where: where,
        take: input.limit,
        select: {
          collection_id: true,
          collection_name: true,
          agency: {
            select: {
              agency_name: true,
            },
          },
        },
      });
    }),
});
