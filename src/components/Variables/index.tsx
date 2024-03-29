import { type ReactNode, useEffect, useMemo, useState } from "react";

import Link from "next/link";
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

import Download from "../Download";
import {
  PlaceholderRows,
  TableCell,
  TableHeader,
  TablePaginator,
} from "../Table";

type Variable = ArrayElement<RouterOutputs["variables"]["all"]["variables"]>;

type DataType = {
  variables: Variable[];
  count: number;
};
type Props = {
  limit?: number;
  dataset_id?: string;
  data?: DataType;
};

const columnHelper = createColumnHelper<Variable>();
const columns = [
  columnHelper.accessor("variable_name", {
    header: () => "Name",
    cell: (info) => (
      <TableCell
        text={info.getValue()}
        subtext={info.row.original.variable_id}
        style="id"
      />
    ),
  }),
  columnHelper.accessor((row) => row.dataset?.dataset_name, {
    id: "dataset_name",
    header: () => "Dataset / Collection",
    cell: (info) => (
      <TableCell
        text={info.row.original.dataset?.dataset_name || <em>Not Available</em>}
        subtext={info.row.original.dataset?.collection?.collection_name}
        style="name"
        indicator={
          info.row.original.dataset?.collection &&
          info.row.original.dataset?.collection.description !== null
            ? "success"
            : "none"
        }
      />
    ),
  }),
];

export default function Variables({ limit, dataset_id, data }: Props) {
  const router = useRouter();
  const { query } = router;

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: limit ?? 10,
  });
  const [pageCount, setPageCount] = useState(0);

  const [placeholder, setPlaceholder] = useState(data);
  const [sortBy, setSortBy] = useState<"order" | "name">("order");

  const {
    data: varData,
    fetchStatus,
    status,
  } = api.variables.all.useQuery(
    {
      term: dataset_id ? undefined : (query.s as string),
      include: query.include as string,
      exact: query.exact === "true",
      limit: limit,
      page: pageIndex + 1,
      dataset_id,
      sort: sortBy,
    },
    {
      placeholderData: placeholder,
    }
  );

  const variables = varData?.variables;
  const nVariables = varData?.count;

  useEffect(() => {
    if (fetchStatus === "idle" && status === "success")
      setPlaceholder(undefined);
  }, [status, fetchStatus]);

  useEffect(() => {
    setPagination(() => ({
      pageIndex: 0,
      pageSize: limit ?? 10,
    }));
  }, [limit]);

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
          d_id: variable.dataset_id,
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
    if (href === "" || router.asPath === "/variables") return <>{children}</>;
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
      <h3 className="flex justify-between">
        <TitleLink href={dataset_id ? "" : "/variables"}>
          Variables
          {dataset_id && <> in this dataset</>}
          {variables && <> ({nVariables})</>}
        </TitleLink>
        {nVariables && nVariables < 1000 && (
          <Download
            data="variables"
            query={{
              term: dataset_id ? undefined : (query.s as string),
              include: query.include as string,
              exact: query.exact === "true",
              dataset_id,
              sort: sortBy,
            }}
          />
        )}
      </h3>

      {status === "error" ? (
        <p className="flex items-center text-red-600 text-sm my-2">
          <XCircleIcon className="w-5 h-5 mr-2" />
          Failed to load variables - please refresh the page and contact us if
          the problem persists.
        </p>
      ) : (
        <div className="p-2">
          {dataset_id && (
            <div className="flex justify-end items-center text-sm gap-2">
              <span>Sort by:</span>
              <span
                className={
                  sortBy === "order"
                    ? "border-b border-gray-500"
                    : "cursor-pointer"
                }
                onClick={() => setSortBy("order")}
              >
                Dictionary order
              </span>
              <span>|</span>
              <span
                className={
                  sortBy === "name"
                    ? "border-b border-gray-500"
                    : "cursor-pointer"
                }
                onClick={() => setSortBy("name")}
              >
                Name
              </span>
            </div>
          )}
          <table className="w-full text-left table-fixed">
            <TableHeader table={table} />
            <tbody>
              {!variables ? (
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
