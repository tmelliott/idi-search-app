import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import currentRefreshes from "~/utils/refreshes";

const REFRESH_PROM = currentRefreshes();

export const variablesRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        term: z.string().optional(),
        include: z.string().optional(),
        exact: z.boolean().default(false),
        limit: z.number().optional(),
        page: z.number().optional(),
        dataset_id: z.string().optional(),
        sort: z.enum(["order", "name"]).default("order"),
      })
    )
    .query(async ({ ctx, input }) => {
      let where: Prisma.variablesFindManyArgs["where"] = {};

      if (input.term)
        where = input.exact
          ? {
              OR: [
                { variable_name: { contains: input.term } },
                { variable_id: { contains: input.term } },
                { description: { contains: input.term } },
              ],
            }
          : {
              OR: [
                {
                  AND: [
                    {
                      variable_name: {
                        search: input.term,
                      },
                    },
                    {
                      description: {
                        search: input.term,
                      },
                    },
                  ],
                },
                { variable_id: { contains: input.term } },
              ],
            };

      if (input.dataset_id) {
        where = {
          ...where,
          dataset_id: input.dataset_id,
        };
      }

      if (input.include) {
        const current_refreshes = await REFRESH_PROM;
        const inc = input.include.split(",");
        const incs = inc
          .map((d) => (d === "refreshes" ? current_refreshes : "Adhoc"))
          .flat();
        const incsWhere = incs.map((inc) => ({
          refreshes: {
            contains: inc,
          },
        }));
        where = {
          AND: { ...(where || null) },
          OR: incsWhere,
        };
      }

      const limit = input.limit || 10;
      const page = input.page || 1;

      const count = await ctx.prisma.variables.count({
        where: where,
      });

      const variables = await ctx.prisma.variables.findMany({
        where: where,
        take: input.limit,
        skip: limit * (page - 1),
        select: {
          variable_id: true,
          variable_name: true,
          dataset_id: true,
          dataset: {
            select: {
              dataset_name: true,
              collection: {
                select: {
                  collection_name: true,
                  description: true,
                },
              },
            },
          },
          dd_order: true,
          description: true,
        },
        orderBy: input.dataset_id
          ? input.sort === "name"
            ? [
                {
                  variable_name: "asc",
                },
              ]
            : [
                {
                  dd_order: "asc",
                },
              ]
          : undefined,
      });

      return {
        count,
        variables,
      };
    }),
  get: publicProcedure
    .input(
      z.object({
        variable_id: z.string(),
        dataset_id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { variable_id, dataset_id } = input;
      const variable = await ctx.prisma.variables.findUnique({
        where: {
          v_id: {
            dataset_id: dataset_id,
            variable_id: variable_id,
          },
        },
        include: {
          dataset: {
            select: {
              dataset_id: true,
              dataset_name: true,
              collection: {
                select: {
                  collection_id: true,
                  collection_name: true,
                  agency: {
                    select: {
                      agency_id: true,
                      agency_name: true,
                    },
                  },
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
          },
          alternate: {
            select: {
              table_id: true,
              alt_variable_id: true,
            },
          },
          matches: {
            select: {
              table_id: true,
              variable_id: true,
            },
          },
        },
      });

      if (!variable) return null;

      const refreshes_raw = variable.refreshes || null;
      const current_refreshes = await REFRESH_PROM;
      const refreshes =
        refreshes_raw && refreshes_raw.length
          ? current_refreshes.map((r) => ({
              refresh: r,
              available: refreshes_raw.match(r) !== null,
            }))
          : null;

      const { matches, alternate, dataset, ...vble } = variable;
      const { matches: tmatch, alternate: talt, ...tbl } = dataset;

      return {
        ...vble,
        dataset: {
          ...tbl,
          matches: tmatch.map((m) => m.table).concat(talt.map((a) => a.match)),
        },
        matches: matches.concat(
          alternate.map((a) => ({
            table_id: a.table_id,
            variable_id: a.alt_variable_id,
          }))
        ),
        database: variable.refreshes
          ? variable.refreshes.match("Adhoc|RnD|Metadata")
            ? variable.refreshes
            : "IDI Clean"
          : null,
        refreshes: refreshes,
      };
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
  codes: publicProcedure
    .input(
      z.object({
        variable_id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { variable_id } = input;
      return ctx.prisma.code_values.findMany({
        where: {
          variable_id: variable_id,
        },
        select: {
          code: true,
          label: true,
        },
      });
    }),
});
