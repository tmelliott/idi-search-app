import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ArrayElement } from "~/types/types";

export const collectionsRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        term: z.string().optional(),
        limit: z.number().optional(),
        agency_id: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => {
      let where: Prisma.collectionsFindManyArgs["where"] = input.term
        ? {
            OR: [
              { collection_name: { contains: input.term } },
              { collection_id: { contains: input.term } },
            ],
          }
        : {};

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
});
