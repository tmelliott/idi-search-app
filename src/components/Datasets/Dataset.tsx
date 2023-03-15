import Link from "next/link";
import { useRouter } from "next/router";

import { CogIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";

import HighlightedMarkdown from "../HighlightedMarkdown";
import Variables from "../Variables";
import Links from "../Variables/Links";

type Props = {
  dataset_id: string;
};

function Dataset({ dataset_id }: Props) {
  const { query } = useRouter();

  const {
    data: dataset,
    isLoading,
    isError,
  } = api.datasets.get.useQuery({
    dataset_id,
  });

  if (isLoading) return <CogIcon className="h-10 mb-4 animate-spin" />;
  if (isError)
    return (
      <p>
        Error loading collection with id <pre>{dataset_id}</pre>.
      </p>
    );

  if (!dataset) return <p>Dataset not found.</p>;

  return (
    <div className="prose">
      <div className="text-xs uppercase">Dataset</div>
      <Link href={`/datasets/${dataset.dataset_id}`}>
        <h2 className="mt-0">{dataset.dataset_name}</h2>
      </Link>
      {dataset.collection && (
        <div className="text-xs">
          In collection:{` `}
          <Link
            href={`/collections/${dataset.collection.collection_id}`}
            className="underline cursor-pointer"
          >
            {dataset.collection.collection_name}
          </Link>
        </div>
      )}
      {dataset.collection && dataset.collection.agency && (
        <div className="text-xs">
          Data Supply Agency:{` `}
          <Link
            href={`/agencies/${dataset.collection.agency.agency_id}`}
            className="underline cursor-pointer"
          >
            {dataset.collection.agency.agency_name}
          </Link>
        </div>
      )}
      {dataset.description && (
        <HighlightedMarkdown
          text={dataset.description}
          highlight={query.s as string}
        />
      )}

      <Links
        dataset_id={dataset.dataset_id}
        variables={dataset.variables.filter((v) =>
          v.variable_id.includes("uid")
        )}
      />

      {dataset.matches.length > 0 && (
        <div>
          <h4>Alternative names</h4>
          <p>
            These are other datasets the may be the same, with a different name.
          </p>
          <ul>
            {dataset.matches.map((d) => (
              <Link
                key={d.dataset_id}
                href={`/datasets/${dataset.dataset_id}?v=dataset&id=${d.dataset_id}`}
              >
                <li className="cursor-pointer">
                  {d.dataset_name || d.dataset_id}
                </li>
              </Link>
            ))}
          </ul>
        </div>
      )}
      <Variables
        limit={10}
        dataset_id={dataset.dataset_id}
        // title="Variables in this dataset"
        // paginate={5}
      />
    </div>
  );
}

export default Dataset;
