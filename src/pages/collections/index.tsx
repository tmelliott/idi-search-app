import HeadTags from "~/layout/Head";
import { type NextPageWithLayout } from "~/types/types";

import Collections from "../../components/Collections";

// a list of collections
const CollectionsPage: NextPageWithLayout = () => {
  return (
    <>
      <HeadTags title="Collections" />

      <Collections />
    </>
  );
};

CollectionsPage.Layout = "Dual";
export default CollectionsPage;
