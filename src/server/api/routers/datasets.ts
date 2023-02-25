import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const datasetsRouter = createTRPCRouter({
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
              { dataset_id: { contains: input.term } },
              { dataset_name: { contains: input.term } },
              { description: { contains: input.term } },
            ],
          }
        : {};

      return ctx.prisma.datasets.findMany({
        where: where,
        take: input.limit,
      });
    }),
});
