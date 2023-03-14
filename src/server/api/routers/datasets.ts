import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const datasetsRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        term: z.string().optional(),
        limit: z.number().optional(),
        collection_id: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => {
      let where: Prisma.datasetsFindManyArgs["where"] = input.term
        ? {
            OR: [
              { dataset_id: { contains: input.term } },
              { dataset_name: { contains: input.term } },
              { description: { contains: input.term } },
            ],
          }
        : {};

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
          description: true,
        },
      });
    }),
});
