import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import Agencies from "~/components/Agencies";
import HeadTags from "~/layout/Head";
import { NextPageWithLayout } from "~/types/types";

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
