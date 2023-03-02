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

import {
  PlaceholderRows,
  TableCell,
  TableHeader,
  TablePaginator,
} from "../Table";

type Collection = ArrayElement<RouterOutputs["collections"]["all"]>;

const columnHelper = createColumnHelper<Collection>();
const columns = [
  columnHelper.accessor("collection_name", {
    header: () => "Name",
    cell: (info) => <TableCell text={info.getValue()} />,
  }),
  columnHelper.accessor((row) => row.agency?.agency_name, {
    id: "agency_name",
    header: () => "Agency",
    cell: (info) => (
      <TableCell
        text={info.getValue()}
        indicator={info.row.original.description !== null ? "success" : "none"}
      />
    ),
  }),
];

type Props = {
  limit?: number;
  agency_id?: string;
};

export default function Collections({ limit, agency_id }: Props) {
  const router = useRouter();
  const { query } = router;
  const {
    data: collections,
    isFetching,
    isError,
  } = api.collections.all.useQuery({
    term: query.s as string,
    agency_id,
  });

  const table = useReactTable({
    data: collections || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    if (limit) table.setPageSize(limit);
    else if (collections) table.setPageSize(collections.length);
    else table.setPageSize(3);
  }, [table, collections, limit]);

  const viewCollection = (collection: Collection) => {
    void router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "collection",
          id: collection.collection_id,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <section>
      <h3>
        Collections
        {agency_id && <> by this agency</>}
        {collections && <> ({collections.length})</>}
      </h3>

      {isError ? (
        <p className="flex items-center text-red-600 text-sm my-2">
          <XCircleIcon className="w-5 h-5 mr-2" />
          Failed to load collections - please refresh the page and contact us if
          the problem persists.
        </p>
      ) : (
        <div className="p-2">
          <table className="w-full text-left table-fixed">
            <TableHeader table={table} />
            <tbody>
              {isFetching ? (
                <PlaceholderRows n={limit ?? 5} m={columns.length}>
                  ...
                </PlaceholderRows>
              ) : (
                <>
                  {/* TODO: move this to a component also */}
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => viewCollection(row.original)}
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
