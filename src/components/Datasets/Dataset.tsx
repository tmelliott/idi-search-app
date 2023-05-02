import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { CogIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
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
        Error loading dataset with id <pre>{dataset_id}</pre>.
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

      <RegexMatches dataset_id={dataset.dataset_id} />

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

const RegexMatches = ({ dataset_id }: { dataset_id: string }) => {
  const [showInfo, setShowInfo] = useState(false);

  const { data: matches } = api.datasets.regexMatches.useQuery({ dataset_id });

  if (!matches) return <></>;

  return (
    <div>
      <h4 className="flex items-center">
        Versions of this dataset
        <InformationCircleIcon
          className="h-4 w-4 ml-2 cursor-pointer hover:text-blue-700"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          // onClick={() => setShowLinkInfo(!showLinkInfo)}
        />
      </h4>
      <div className="relative">
        {showInfo && (
          <p className="absolute bg-gray-100 px-4 py-2 my-0 shadow z-20">
            This dataset is updated regularly. Each time it is updated, a new
            version is created with a unique ID. This list shows all instances
            of this variable in the IDI.
          </p>
        )}
      </div>
      <ul className="max-h-48 overflow-scroll">
        {matches.map((d) => (
          <li key={d.dataset_id} className="m-0">
            {d.dataset_id}
          </li>
        ))}
      </ul>
    </div>
  );
};
