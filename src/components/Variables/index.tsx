import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { XCircleIcon } from "@heroicons/react/24/outline";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { type ArrayElement } from "~/types/types";
import { api, type RouterOutputs } from "~/utils/api";

import { PlaceholderRows, TableHeader, TablePaginator } from "../Table";

type Props = {
  limit?: number;
};

type Variable = ArrayElement<RouterOutputs["variables"]["all"]["variables"]>;

const columnHelper = createColumnHelper<Variable>();
const columns = [
  columnHelper.accessor("variable_name", {
    header: () => "Name",
    cell: (info) => (
      <div>
        <div>{info.getValue()}</div>
        <div className="text-xs text-gray-500">
          {info.row.original.variable_id}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor((row) => row.dataset?.dataset_name, {
    id: "dataset_name",
    header: () => "Collection / Agency",
    cell: (info) => (
      <div>
        <div>{info.getValue()}</div>
        <div className="text-xs">
          {info.row.original.dataset?.collection?.collection_name}
        </div>
      </div>
    ),
  }),
];

export default function Variables({ limit }: Props) {
  const router = useRouter();
  const { query } = router;

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: limit ?? 10,
  });
  const [pageCount, setPageCount] = useState(0);

  const { data, isFetching, isError } = api.variables.all.useQuery({
    term: query.s as string,
    limit: limit,
    page: pageIndex + 1,
  });

  const variables = data?.variables;
  const nVariables = data?.count;

  useEffect(() => {
    if (nVariables) {
      setPageCount(Math.ceil(nVariables / pageSize));
    }
  }, [nVariables, pageSize]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: variables || [],
    columns,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const viewVariable = (variable: Variable) => {
    void router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "variable",
          id: variable.variable_id,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <section>
      <h3>
        Variables
        {variables && <> ({nVariables})</>}
      </h3>

      {isError ? (
        <p className="flex items-center text-red-600 text-sm my-2">
          <XCircleIcon className="w-5 h-5 mr-2" />
          Failed to load variables - please refresh the page and contact us if
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
                      onClick={() => viewVariable(row.original)}
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
