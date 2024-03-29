import { type ReactNode, useEffect, useState } from "react";

import Link from "next/link";
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

import Download from "../Download";
import {
  PlaceholderRows,
  TableCell,
  TableHeader,
  TablePaginator,
} from "../Table";

type Agency = Prisma.agencies;

type Props = {
  limit?: number;
  data?: Agency[];
};

const columnHelper = createColumnHelper<Agency>();
const columns = [
  columnHelper.accessor("agency_name", {
    header: () => "Name",
    cell: (info) => <TableCell text={info.getValue()} />,
  }),
];

export default function Agencies({ limit, data }: Props) {
  const router = useRouter();
  const { query } = router;
  const [placeholder, setPlaceholder] = useState(data);
  const {
    data: agencies,
    status,
    fetchStatus,
  } = api.agencies.all.useQuery(
    {
      term: query.s as string,
      exact: query.exact === "true",
    },
    {
      placeholderData: placeholder,
    }
  );

  const table = useReactTable({
    data: agencies || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    if (fetchStatus === "idle" && status === "success")
      setPlaceholder(undefined);
  }, [fetchStatus, status]);

  useEffect(() => {
    if (limit) table.setPageSize(limit);
    else if (agencies) table.setPageSize(agencies.length);
    else table.setPageSize(3);
  }, [table, agencies, limit]);

  const viewAgency = (agency: Agency) => {
    void router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          v: "agency",
          id: agency.agency_id,
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
    if (router.asPath === "/agencies") return <>{children}</>;
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
        <TitleLink href="/agencies">
          Data Supply Agencies
          {agencies && fetchStatus === "idle" && <> ({agencies.length})</>}
        </TitleLink>

        {agencies && <Download data={agencies} />}
      </h3>

      {status === "error" ? (
        <p className="flex items-center text-red-600 text-sm my-2">
          <XCircleIcon className="w-5 h-5 mr-2" />
          Failed to load agencies - please refresh the page and contact us if
          the problem persists.
        </p>
      ) : (
        <div className="p-2">
          <table className="w-full text-left">
            <TableHeader table={table} />
            <tbody>
              {!agencies ? (
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
                      onClick={() => viewAgency(row.original)}
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
