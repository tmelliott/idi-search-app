import { useEffect } from "react";

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

import { PlaceholderRows, TableHeader, TablePaginator } from "../Table";

type Props = {
  limit?: number;
};

type Dataset = ArrayElement<RouterOutputs["datasets"]["all"]>;

const columnHelper = createColumnHelper<Dataset>();
const columns = [
  columnHelper.accessor("dataset_name", {
    header: () => "Name",
    cell: (info) => (
      <div>
        <div>{info.getValue()}</div>
        <div className="text-xs text-gray-500">
          {info.row.original.dataset_id}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor((row) => row.collection?.collection_name, {
    id: "collection_name",
    header: () => "Collection / Agency",
    cell: (info) => (
      <div>
        <div>{info.getValue()}</div>
        <div className="text-xs">
          {info.row.original.collection?.agency?.agency_name}
        </div>
      </div>
    ),
  }),
];

export default function Datasets({ limit }: Props) {
  const router = useRouter();
  const { query } = router;
  const {
    data: datasets,
    isFetching,
    isError,
  } = api.datasets.all.useQuery({
    term: query.s as string,
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

  return (
    <section>
      <h3>
        Datasets
        {datasets && <> ({datasets.length})</>}
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
          {limit && <TablePaginator table={table} />}
        </div>
      )}
    </section>
  );
}
