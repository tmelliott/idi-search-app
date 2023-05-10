import { type ReactNode, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { XCircleIcon } from "@heroicons/react/24/outline";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type ArrayElement } from "~/types/types";
import { api, type RouterOutputs } from "~/utils/api";

import {
  PlaceholderRows,
  TableCell,
  TableHeader,
  TablePaginator,
} from "../Table";

type Dataset = ArrayElement<RouterOutputs["datasets"]["all"]>;

type Props = {
  limit?: number;
  collection_id?: string;
  data?: Dataset[];
};

const columnHelper = createColumnHelper<Dataset>();
const columns = [
  columnHelper.accessor("dataset_name", {
    header: () => "Name",
    cell: (info) => (
      <TableCell
        text={info.getValue()}
        subtext={info.row.original.dataset_id}
        style="id"
      />
    ),
  }),
  columnHelper.accessor((row) => row.collection?.collection_name, {
    id: "collection_name",
    header: () => "Collection / Agency",
    cell: (info) => (
      <TableCell
        text={
          info.row.original.collection?.collection_name || (
            <em>Not Available</em>
          )
        }
        subtext={info.row.original.collection?.agency?.agency_name}
        style="name"
        indicator={info.row.original.description !== null ? "success" : "none"}
      />
    ),
  }),
];

export default function Datasets({ limit, collection_id, data }: Props) {
  const router = useRouter();
  const { query } = router;
  const [placeholder, setPlaceholder] = useState(data);
  const {
    data: datasets,
    status,
    fetchStatus,
  } = api.datasets.all.useQuery(
    {
      term: collection_id ? undefined : (query.s as string),
      exact: query.exact === "true",
      collection_id,
    },
    {
      placeholderData: placeholder,
    }
  );

  const table = useReactTable({
    data: datasets || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    if (fetchStatus === "idle" && status === "success")
      setPlaceholder(undefined);
  }, [status, fetchStatus]);

  useEffect(() => {
    if (limit) table.setPageSize(limit);
    else if (datasets) table.setPageSize(datasets.length);
    else table.setPageSize(3);
  }, [table, datasets, limit]);

  const viewDataset = (dataset: Dataset) => {
    void router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "dataset",
          id: dataset.dataset_id,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const TitleLink = ({
    children,
    href,
  }: {
    children: ReactNode;
    href: string;
  }) => {
    if (href === "" || router.asPath === "/datasets") return <>{children}</>;
    return (
      <Link
        href={{
          pathname: href,
          query: router.query,
        }}
      >
        {children}
      </Link>
    );
  };

  return (
    <section>
      <h3>
        <TitleLink href={collection_id ? "" : "/datasets"}>
          Datasets
          {collection_id && <> in this collection</>}
          {datasets && fetchStatus === "idle" && <> ({datasets.length})</>}
        </TitleLink>
      </h3>

      {status === "error" ? (
        <p className="flex items-center text-red-600 text-sm my-2">
          <XCircleIcon className="w-5 h-5 mr-2" />
          Failed to load datasets - please refresh the page and contact us if
          the problem persists.
        </p>
      ) : (
        <div className="p-2">
          <table className="w-full text-left table-fixed">
            <TableHeader table={table} />
            <tbody>
              {!datasets ? (
                <PlaceholderRows
                  n={limit ?? 5}
                  m={table.getLeafHeaders().length}
                >
                  <div>
                    <div>...</div>
                    <div className="text-xs">...</div>
                  </div>
                </PlaceholderRows>
              ) : (
                <>
                  {/* TODO: move this to a component also */}
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => viewDataset(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-1">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
          {limit && (
            <TablePaginator
              loading={fetchStatus === "fetching"}
              table={table}
            />
          )}
        </div>
      )}
    </section>
  );
}
