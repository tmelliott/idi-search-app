import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const variablesRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        term: z.string().optional(),
        limit: z.number().optional(),
        page: z.number().optional(),
        dataset_id: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => {
      let where: Prisma.variablesFindManyArgs["where"] = input.term
        ? {
            OR: [
              { variable_id: { contains: input.term } },
              { variable_name: { contains: input.term } },
              { description: { contains: input.term } },
            ],
          }
        : {};

      if (input.dataset_id) {
        where = {
          ...where,
          dataset_id: input.dataset_id,
        };
      }

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
          description: true,
        },
      });

      return Promise.all([count, variables]).then(([count, variables]) => {
        return {
          count,
          variables,
        };
      });
    }),
  links: publicProcedure
    .input(
      z.object({
        variable_id: z.string(),
        dataset_id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { variable_id, dataset_id } = input;

      return ctx.prisma.variables.findMany({
        where: {
          variable_id: variable_id,
          NOT: {
            dataset_id: dataset_id,
          },
        },
        select: {
          dataset: {
            select: {
              dataset_id: true,
              dataset_name: true,
            },
          },
        },
      });
    }),
});
