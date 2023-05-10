import { useState } from "react";

import PageSize from "~/components/PageSize";
import HeadTags from "~/layout/Head";
import { type NextPageWithLayout } from "~/types/types";

import Datasets from "../../components/Datasets";

// a list of datasets
const DatasetsPage: NextPageWithLayout = () => {
  const [perPage, setPerPage] = useState(20);

  return (
    <>
      <HeadTags title="Datasets" />

      <PageSize value={perPage} setter={setPerPage} />
      <Datasets limit={perPage} />
    </>
  );
};

DatasetsPage.Layout = "Dual";
export default DatasetsPage;
