import { useRouter } from "next/router";

import { XCircleIcon } from "@heroicons/react/24/outline";
import type Prisma from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { api } from "~/utils/api";

type Props = {
  limit?: number;
};

type Agency = Prisma.agencies;

const columnHelper = createColumnHelper<Agency>();
const columns = [
  columnHelper.accessor("agency_name", {
    header: () => "Name",
    cell: (info) => <>{info.getValue()}</>,
  }),
];

export default function Agencies({ limit }: Props) {
  const router = useRouter();
  const { query } = router;
  const {
    data: agencies,
    isFetching,
    isError,
  } = api.agencies.all.useQuery({
    term: query.s as string,
    limit,
  });

  const table = useReactTable({
    data: agencies || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

  const tempArray = Array(limit ?? 3).fill(0) as number[];

  return (
    <section>
      <h3>Data Supply Agencies</h3>

      {isError ? (
        <p className="flex items-center text-red-600 text-sm my-2">
          <XCircleIcon className="w-5 h-5 mr-2" />
          Failed to load agencies - please refresh the page and contact us if
          the problem persists.
        </p>
      ) : (
        <div className="p-2">
          <table className="w-full text-left">
            <thead className="border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isFetching
                ? [...tempArray].map((_i, i) => (
                    <tr className="border-b text-sm" key={i}>
                      <td className="py-1" colSpan={columns.length}>
                        <div className="animate-pulse bg-gray-100 text-gray-50">
                          ...
                        </div>
                      </td>
                    </tr>
                  ))
                : table.getRowModel().rows.map((row) => (
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
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
