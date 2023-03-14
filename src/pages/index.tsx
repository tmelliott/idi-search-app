import { type GetStaticProps } from "next";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import superjson from "superjson";
import Agencies from "~/components/Agencies";
import Collections from "~/components/Collections";
import Datasets from "~/components/Datasets";
import Variables from "~/components/Variables";
import HeadTags from "~/layout/Head";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { type NextPageWithLayout } from "~/types/types";

const LIMITS = {
  agencies: 2,
  collections: 3,
  datasets: 5,
  variables: 10,
};

const Home: NextPageWithLayout = () => {
  return (
    <>
      <HeadTags />

      <Agencies limit={LIMITS.agencies} />
      <Collections limit={LIMITS.collections} />
      <Datasets limit={LIMITS.datasets} />
      <Variables limit={LIMITS.variables} />
    </>
  );
};

Home.Layout = "Dual";
export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma },
    transformer: superjson,
  });

  await ssg.agencies.all.fetch({ limit: LIMITS.agencies });
  await ssg.collections.all.fetch({ limit: LIMITS.collections });
  await ssg.datasets.all.fetch({ limit: LIMITS.datasets });
  await ssg.variables.all.fetch({ limit: LIMITS.variables });

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};
