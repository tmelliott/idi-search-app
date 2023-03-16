import { useRouter } from "next/router";

import Dataset from "~/components/Datasets/Dataset";
import HeadTags from "~/layout/Head";
import { api } from "~/utils/api";

function DatasetPage() {
  const router = useRouter();
  console.log(router.query);
  const dataset_id = router.query.dataset_id as string;
  console.log(dataset_id);

  const {
    data: dataset,
    isLoading,
    isError,
  } = api.datasets.get.useQuery({ dataset_id });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <>
      <HeadTags title={"Dataset | " + (dataset?.dataset_name || "Unknown")} />
      <Dataset dataset_id={dataset_id} />
    </>
  );
}

DatasetPage.Layout = "Dual";

export default DatasetPage;
