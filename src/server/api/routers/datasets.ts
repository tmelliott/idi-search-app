import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const datasetsRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        term: z.string().optional(),
        limit: z.number().optional(),
        exact: z.boolean().optional(),
        collection_id: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => {
      let where: Prisma.datasetsFindManyArgs["where"] = {};

      if (input.term)
        where = input.exact
          ? {
              OR: [
                { dataset_id: { contains: input.term } },
                { dataset_name: { contains: input.term } },
                { description: { contains: input.term } },
              ],
            }
          : {
              OR: [
                { dataset_id: { contains: input.term } },
                {
                  AND: [
                    { dataset_name: { search: input.term } },
                    { description: { search: input.term } },
                  ],
                },
              ],
            };

      if (input.collection_id) {
        where = {
          ...where,
          collection_id: input.collection_id,
        };
      }

      return ctx.prisma.datasets.findMany({
        where: where,
        take: input.limit,
        select: {
          dataset_id: true,
          dataset_name: true,
          collection: {
            select: {
              collection_name: true,
              agency: {
                select: {
                  agency_name: true,
                },
              },
            },
          },
          dd_order: true,
          description: true,
        },
        orderBy: input.collection_id
          ? [
              {
                collection: {
                  collection_name: "asc",
                },
              },
              {
                dd_order: "asc",
              },
            ]
          : undefined,
      });
    }),
  get: publicProcedure
    .input(
      z.object({
        dataset_id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dataset = await ctx.prisma.datasets.findUnique({
        where: { dataset_id: input.dataset_id },
        include: {
          collection: {
            select: {
              collection_id: true,
              collection_name: true,
              agency: {
                select: {
                  agency_name: true,
                  agency_id: true,
                },
              },
            },
          },
          variables: {
            select: {
              variable_id: true,
              variable_name: true,
              dataset_id: true,
            },
          },
          alternate: {
            select: {
              match: true,
            },
          },
          matches: {
            select: {
              table: true,
            },
          },
        },
      });

      if (!dataset) return;

      const { matches, alternate, ...ds } = dataset;
      return {
        ...ds,
        matches: matches
          .map((m) => m.table)
          .concat(alternate.map((a) => a.match)),
      };
    }),
  regexMatches: publicProcedure
    .input(
      z.object({
        dataset_id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const matches = await ctx.prisma.datasets_regex.findMany({
        where: { regex_id: input.dataset_id },
      });

      return matches;
    }),
});
