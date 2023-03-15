import { ReactNode, useEffect } from "react";

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

type Props = {
  limit?: number;
  collection_id?: string;
};

type Dataset = ArrayElement<RouterOutputs["datasets"]["all"]>;

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

export default function Datasets({ limit, collection_id }: Props) {
  const router = useRouter();
  const { query } = router;
  const {
    data: datasets,
    isFetching,
    isError,
  } = api.datasets.all.useQuery({
    term: query.s as string,
    collection_id,
  });

  const table = useReactTable({
    data: datasets || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
    if (router.asPath === "/datasets") return <>{children}</>;
    return <Link href={href}>{children}</Link>;
  };

  return (
    <section>
      <h3>
        <TitleLink href="/datasets">
          Datasets
          {collection_id && <> in this collection</>}
          {datasets && <> ({datasets.length})</>}
        </TitleLink>
      </h3>

      {isError ? (
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
              {isFetching ? (
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
          {limit && <TablePaginator loading={isFetching} table={table} />}
        </div>
      )}
    </section>
  );
}
