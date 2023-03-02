import { useRouter } from "next/router";

import Agency from "~/components/Agencies/Agency";
import HeadTags from "~/layout/Head";
import { api } from "~/utils/api";

function AgencyPage() {
  const router = useRouter();
  console.log(router.query);
  const agency_id = router.query.agency_id as string;
  console.log(agency_id);

  const {
    data: agency,
    isLoading,
    isError,
  } = api.agencies.get.useQuery({ agency_id });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <>
      <HeadTags title={("Agency | " + agency?.agency_name) as string} />
      <Agency agency_id={agency_id} />
    </>
  );
}

AgencyPage.Layout = "Dual";

export default AgencyPage;
