import Agencies from "~/components/Agencies";
import Collections from "~/components/Collections";
import Datasets from "~/components/Datasets";
import Variables from "~/components/Variables";
import HeadTags from "~/layout/Head";
import { type NextPageWithLayout } from "~/types/types";

const Home: NextPageWithLayout = () => {
  return (
    <>
      <HeadTags />

      <Agencies limit={2} />
      <Collections limit={3} />
      <Datasets limit={5} />
      <Variables limit={10} />
    </>
  );
};

Home.Layout = "Dual";
export default Home;
