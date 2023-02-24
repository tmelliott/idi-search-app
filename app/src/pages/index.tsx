import Agencies from "~/components/Agencies";
import HeadTags from "~/layout/Head";
import { type NextPageWithLayout } from "~/types/types";

const Home: NextPageWithLayout = () => {
  return (
    <>
      <HeadTags />

      <Agencies limit={3} />
    </>
  );
};

Home.Layout = "Dual";
export default Home;
