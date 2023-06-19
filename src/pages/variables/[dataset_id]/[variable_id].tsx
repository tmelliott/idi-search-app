import { useRouter } from "next/router";

import Variable from "~/components/Variables/Variable";
import HeadTags from "~/layout/Head";
import { api } from "~/utils/api";

function VariablePage() {
  const router = useRouter();
  console.log(router.query);
  const variable_id = router.query.variable_id as string;
  const dataset_id = router.query.dataset_id as string;

  const {
    data: variable,
    isLoading,
    isError,
  } = api.variables.get.useQuery({ variable_id, dataset_id });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <>
      <HeadTags
        title={"Variable | " + (variable?.variable_name || "Unknown")}
      />
      <Variable variable_id={variable_id} dataset_id={dataset_id} />
    </>
  );
}

VariablePage.Layout = "Dual";

export default VariablePage;
