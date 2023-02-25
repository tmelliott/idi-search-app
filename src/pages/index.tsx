import Agencies from "~/components/Agencies";
import Collections from "~/components/Collections";
import Datasets from "~/components/Datasets";
import HeadTags from "~/layout/Head";
import { type NextPageWithLayout } from "~/types/types";

const Home: NextPageWithLayout = () => {
  return (
    <>
      <HeadTags />

      <Agencies limit={2} />
      <Collections limit={3} />
      <Datasets limit={5} />
    </>
  );
};

Home.Layout = "Dual";
export default Home;
