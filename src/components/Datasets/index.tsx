import { useEffect } from "react";

import { useRouter } from "next/router";

import { XCircleIcon } from "@heroicons/react/24/outline";
import type Prisma from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { api } from "~/utils/api";

import { PlaceholderRows, TableHeader, TablePaginator } from "../Table";

type Props = {
  limit?: number;
};

type Dataset = Prisma.datasets;

const columnHelper = createColumnHelper<Dataset>();
const columns = [
  columnHelper.accessor("dataset_name", {
    header: () => "Name",
    cell: (info) => <>{info.getValue()}</>,
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
          <table className="w-full text-left">
            <TableHeader table={table} />
            <tbody>
              {isFetching ? (
                <PlaceholderRows n={limit ?? 5} m={columns.length} />
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

              {limit && <TablePaginator table={table} />}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
