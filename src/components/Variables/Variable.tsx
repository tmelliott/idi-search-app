import Link from "next/link";
import { useRouter } from "next/router";

import { CogIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";

import HighlightedMarkdown from "../HighlightedMarkdown";
import Links from "../Variables/Links";
import Refreshes from "./Refreshes";

type Props = {
  dataset_id: string;
  variable_id: string;
};

function Variable({ dataset_id, variable_id }: Props) {
  const { query } = useRouter();

  const {
    data: variable,
    isLoading,
    isError,
  } = api.variables.get.useQuery({
    variable_id,
    dataset_id,
  });

  if (isLoading) return <CogIcon className="h-10 mb-4 animate-spin" />;
  if (isError)
    return (
      <p>
        Error loading variable with id{" "}
        <pre>
          {dataset_id}.{variable_id}
        </pre>
        .
      </p>
    );

  if (!variable) return <p>Variable not found.</p>;

  return (
    <div className="prose">
      <div className="text-xs uppercase">Variable</div>
      <Link href={`/variables/${variable.dataset_id}/${variable.variable_id}`}>
        <h2 className="mt-0">{variable.variable_name}</h2>
      </Link>

      {variable.dataset && (
        <div className="text-xs">
          In dataset:{` `}
          <Link
            href={`/datasets/${variable.dataset.dataset_id}`}
            className="underline cursor-pointer"
          >
            {variable.dataset.dataset_name}
          </Link>
        </div>
      )}
      {variable.dataset.collection && (
        <div className="text-xs">
          In collection:{` `}
          <Link
            href={`/collections/${variable.dataset.collection.collection_id}`}
            className="underline cursor-pointer"
          >
            {variable.dataset.collection.collection_name}
          </Link>
        </div>
      )}
      {variable.dataset.collection && variable.dataset.collection.agency && (
        <div className="text-xs">
          Data Supply Agency:{` `}
          <Link
            href={`/agencies/${variable.dataset.collection.agency.agency_id}`}
            className="underline cursor-pointer"
          >
            {variable.dataset.collection.agency.agency_name}
          </Link>
        </div>
      )}
      {variable.description && (
        <HighlightedMarkdown
          text={variable.description}
          highlight={query.s as string}
        />
      )}

      <div className="">
        <h4>SQL Information</h4>

        <table>
          <tbody>
            <tr>
              <td className="font-bold">Field Name</td>
              <td>{variable.variable_id}</td>
            </tr>
            <tr>
              <td className="font-bold">Table Name</td>
              <td>{variable.dataset_id}</td>
            </tr>
            <tr>
              <td className="font-bold">Type</td>
              <td>{variable.type}</td>
            </tr>
            {variable.size && (
              <tr>
                <td className="font-bold">Size</td>
                <td>{variable.size}</td>
              </tr>
            )}
            <tr>
              <td className="font-bold">Database</td>
              <td>{variable.database || "Missing - please let us know"}</td>
            </tr>
          </tbody>
        </table>

        {variable.database === "IDI Clean" &&
          variable.refreshes &&
          (variable.refreshes.length > 0 ? (
            <Refreshes refreshes={variable.refreshes} />
          ) : (
            <div>
              {/* TODO: is this ever shown? */}
              <>
                <strong>Catalog: </strong>
                {variable.refreshes}
              </>
            </div>
          ))}
      </div>

      {variable.matches.length > 0 && (
        <>
          <h4>This variable may have a different name in other refreshes:</h4>
          <ul>
            {variable.matches.map((v) => (
              <li>
                <Link
                  key={v.variable_id + "_" + v.table_id}
                  href={`/?v=variable&d=${v.table_id}&id=${v.variable_id}`}
                >
                  {v.variable_id}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {variable.dataset.matches.length > 0 && (
        <>
          <h4>
            This variable may be available in other refreshes in a difference
            dataset:
          </h4>
          <ul>
            {variable.dataset.matches.map((d) => (
              <li>
                <Link key={d.dataset_id} href={`/datasets/${d.dataset_id}`}>
                  {d.dataset_name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {variable.variable_id.includes("uid") && (
        <Links
          dataset_id={variable.dataset_id}
          variables={[
            {
              dataset_id: variable.dataset_id,
              variable_id: variable.variable_id,
              variable_name: variable.variable_name,
            },
          ]}
        />
      )}
    </div>
  );
}

export default Variable;
