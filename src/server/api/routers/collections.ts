import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const collectionsRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        term: z.string().optional(),
        limit: z.number().optional(),
        exact: z.boolean().optional(),
        agency_id: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => {
      let where: Prisma.collectionsFindManyArgs["where"] = {};

      if (input.term) {
        where = input.exact
          ? {
              OR: [
                {
                  collection_name: { contains: input.term },
                },
                {
                  description: { contains: input.term },
                },
                { collection_id: { contains: input.term } },
              ],
            }
          : {
              OR: [
                {
                  AND: [
                    {
                      collection_name: { search: input.term },
                    },
                    {
                      description: { search: input.term },
                    },
                  ],
                },
                { collection_id: { contains: input.term } },
              ],
            };
      }

      if (input.agency_id) {
        where = {
          ...where,
          agency_id: input.agency_id,
        };
      }

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
          description: true,
        },
      });
    }),
  get: publicProcedure
    .input(
      z.object({
        collection_id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.collections.findUnique({
        where: { collection_id: input.collection_id },
        select: {
          collection_id: true,
          collection_name: true,
          agency: {
            select: {
              agency_name: true,
              agency_id: true,
            },
          },
          description: true,
        },
      });
    }),
});
