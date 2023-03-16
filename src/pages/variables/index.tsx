import { useState } from "react";

import PageSize from "~/components/PageSize";
import HeadTags from "~/layout/Head";
import { type NextPageWithLayout } from "~/types/types";

import Variables from "../../components/Variables";

// a list of Variables
const VariablesPage: NextPageWithLayout = () => {
  const [perPage, setPerPage] = useState(20);

  return (
    <>
      <HeadTags title="Variables" />

      <PageSize
        value={perPage}
        setter={setPerPage}
        options={[10, 20, 50, 100, 500, 1000]}
      />
      <Variables limit={perPage} />
    </>
  );
};

VariablesPage.Layout = "Dual";
export default VariablesPage;
