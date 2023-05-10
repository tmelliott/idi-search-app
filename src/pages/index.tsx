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
import { api } from "~/utils/api";

const LIMITS = {
  agencies: 2,
  collections: 3,
  datasets: 5,
  variables: 10,
};

const Home: NextPageWithLayout = () => {
  const { data: agencies } = api.agencies.all.useQuery({
    limit: LIMITS.agencies,
  });
  const { data: collections } = api.collections.all.useQuery({
    limit: LIMITS.collections,
  });
  const { data: datasets } = api.datasets.all.useQuery({
    limit: LIMITS.datasets,
  });
  const { data: variables } = api.variables.all.useQuery({
    limit: LIMITS.variables,
  });

  return (
    <>
      <HeadTags />

      <Agencies limit={LIMITS.agencies} data={agencies} />
      <Collections limit={LIMITS.collections} data={collections} />
      <Datasets limit={LIMITS.datasets} data={datasets} />
      <Variables limit={LIMITS.variables} data={variables} />
    </>
  );
};

Home.Layout = "Dual";
export default Home;

export async function getStaticProps() {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma },
    transformer: superjson,
  });

  await ssg.agencies.all.fetch({
    limit: LIMITS.agencies,
  });
  await ssg.collections.all.fetch({
    limit: LIMITS.collections,
  });
  await ssg.datasets.all.fetch({
    limit: LIMITS.datasets,
  });
  await ssg.variables.all.fetch({
    limit: LIMITS.variables,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
}
