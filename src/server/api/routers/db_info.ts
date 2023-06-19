import { createTRPCRouter, publicProcedure } from "../trpc";

export const dbInfoRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.db_info.findUnique({
      where: { id: 1 },
    });
  }),
});
