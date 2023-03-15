import { useState } from "react";

import Link from "next/link";

import {
  CogIcon,
  InformationCircleIcon,
  MagnifyingGlassCircleIcon,
} from "@heroicons/react/24/outline";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "~/server/api/root";
import { api } from "~/utils/api";

type VType = NonNullable<
  inferRouterOutputs<AppRouter>["datasets"]["get"]
>["variables"];

type LinksProps = {
  dataset_id: string;
  variables: VType;
};

const Links = ({ dataset_id, variables }: LinksProps) => {
  const [showLinkInfo, setShowLinkInfo] = useState(false);

  if (variables.length === 0) return null;

  return (
    <div>
      <h4 className="flex items-center">
        Linking variables
        <InformationCircleIcon
          className="h-4 w-4 ml-2 cursor-pointer hover:text-blue-700"
          onMouseEnter={() => setShowLinkInfo(true)}
          onMouseLeave={() => setShowLinkInfo(false)}
          // onClick={() => setShowLinkInfo(!showLinkInfo)}
        />
      </h4>
      <div className="relative">
        {showLinkInfo && (
          <p className="absolute bg-gray-100 px-4 py-2 my-0 shadow z-20">
            The variables can be used to link to other datasets. The number in
            brackets shows the number of links possible. Clicking a variable
            will display a list of all matching variables.
          </p>
        )}
      </div>
      <ul>
        {variables.map((v) => (
          <li className="flex">
            <Link
              key={v.variable_id}
              href={`/variables?s=${v.variable_id}&v=dataset&id=${dataset_id}`}
              className="cursor-pointer flex items-center gap-2 underline hover:text-blue-600 justify-start"
            >
              <MagnifyingGlassCircleIcon className="h-5 w-5" />
              <div>{v.variable_id}</div>
              <VariableLinks
                variable_id={v.variable_id}
                dataset_id={dataset_id}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Links;

const VariableLinks = ({
  variable_id,
  dataset_id,
}: {
  variable_id: string;
  dataset_id: string;
}) => {
  const {
    data: links,
    isLoading,
    isError,
  } = api.variables.links.useQuery({
    variable_id,
    dataset_id,
  });

  if (isLoading) return <CogIcon className="h-4 w-4 animate-spin" />;
  if (isError) return <p>Error loading links.</p>;

  return <span>({links?.length})</span>;
};
