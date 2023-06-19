import HeadTags from "~/layout/Head";
import { type NextPageWithLayout } from "~/types/types";

import Agencies from "../../components/Agencies";

// a list of agencies
const AgenciesPage: NextPageWithLayout = () => {
  return (
    <>
      <HeadTags title="Agencies" />

      <Agencies />
    </>
  );
};

AgenciesPage.Layout = "Dual";
export default AgenciesPage;

// export const getStaticProps: GetStaticProps = async () => {
//   const ssg = createProxySSGHelpers({
//     router: appRouter,
//     ctx: { prisma },
//     transformer: superjson,
//   });

//   await ssg.agencies.all.fetch({});

//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//     },
//     revalidate: 1,
//   };
// };
