import { useState } from "react";

import PageSize from "~/components/PageSize";
import HeadTags from "~/layout/Head";
import { type NextPageWithLayout } from "~/types/types";

import Collections from "../../components/Collections";

// a list of collections
const CollectionsPage: NextPageWithLayout = () => {
  const [perPage, setPerPage] = useState(20);

  return (
    <>
      <HeadTags title="Collections" />

      <PageSize
        value={perPage}
        setter={setPerPage}
        options={[10, 20, 50, 100]}
      />
      <Collections limit={perPage} />
    </>
  );
};

CollectionsPage.Layout = "Dual";
export default CollectionsPage;
