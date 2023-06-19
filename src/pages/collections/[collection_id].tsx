import { useRouter } from "next/router";

import Collection from "~/components/Collections/Collection";
import HeadTags from "~/layout/Head";
import { api } from "~/utils/api";

function CollectionPage() {
  const router = useRouter();
  console.log(router.query);
  const collection_id = router.query.collection_id as string;
  console.log(collection_id);

  const {
    data: collection,
    isLoading,
    isError,
  } = api.collections.get.useQuery({ collection_id });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <>
      <HeadTags
        title={"Collection | " + (collection?.collection_name || "Unknown")}
      />
      <Collection collection_id={collection_id} />
    </>
  );
}

CollectionPage.Layout = "Dual";

export default CollectionPage;
