import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const variablesRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        term: z.string().optional(),
        limit: z.number().optional(),
        page: z.number().optional(),
      })
    )
    .query(({ ctx, input }) => {
      const where = input.term
        ? {
            OR: [
              { variable_id: { contains: input.term } },
              { variable_name: { contains: input.term } },
              { description: { contains: input.term } },
            ],
          }
        : {};

      const limit = input.limit || 10;
      const page = input.page || 1;

      const count = ctx.prisma.variables.count({
        where: where,
      });

      const variables = ctx.prisma.variables.findMany({
        where: where,
        take: input.limit,
        skip: limit * (page - 1),
        select: {
          variable_id: true,
          variable_name: true,
          dataset: {
            select: {
              dataset_name: true,
              collection: {
                select: {
                  collection_name: true,
                },
              },
            },
          },
        },
      });

      return Promise.all([count, variables]).then(([count, variables]) => {
        return {
          count,
          variables,
        };
      });
    }),
});
