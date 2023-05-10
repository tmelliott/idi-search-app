import Link from "next/link";
import { useRouter } from "next/router";

import { CogIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";

import Datasets from "../Datasets";
import HighlightedMarkdown from "../HighlightedMarkdown";

type Props = {
  collection_id: string;
};

export default function Collection({ collection_id }: Props) {
  const { query } = useRouter();

  const {
    data: collection,
    isLoading,
    isError,
  } = api.collections.get.useQuery({
    collection_id,
  });

  if (isLoading) return <CogIcon className="h-10 mb-4 animate-spin" />;
  if (isError)
    return (
      <p>
        Error loading collection with id <pre>{collection_id}</pre>.
      </p>
    );

  if (!collection) return <p>Collection not found.</p>;

  return (
    <div className="prose max-w-none">
      <div className="text-xs uppercase">Collection</div>
      <Link href={`/collections/${collection_id}`}>
        <h2 className="mt-0">{collection?.collection_name}</h2>
      </Link>

      {collection.agency && (
        <div className="text-xs">
          Data Supply Agency:{` `}
          <Link
            href={`/agencies/${collection.agency.agency_id}`}
            className="underline cursor-pointer"
          >
            {collection.agency.agency_name}
          </Link>
        </div>
      )}

      {collection.description && (
        <HighlightedMarkdown
          text={collection.description}
          highlight={query.s as string}
        />
      )}

      <Datasets collection_id={collection_id} limit={15} />
    </div>
  );
}
