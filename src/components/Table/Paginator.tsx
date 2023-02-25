import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Table } from "@tanstack/react-table";

type Props = {
  table: Table<T>;
};

// TODO: add page jumping

export default function TablePaginator({ table }: Props) {
  return (
    <tr className="border-t-2 text-sm border-b-2">
      <td
        className="px-4 py-1 flex justify-between items-center"
        colSpan={table.getHeaderGroups().length}
      >
        <div className="flex items-center gap-2">
          <button
            className="w-6 h-6 cursor-pointer bg-gray-200 p-[2px] rounded hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronDoubleLeftIcon />
          </button>
          <button
            className="w-6 h-6 cursor-pointer bg-gray-200 p-[2px] rounded hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon />
          </button>
        </div>
        <div>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-6 h-6 cursor-pointer bg-gray-200 p-[2px] rounded hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon />
          </button>
          <button
            className="w-6 h-6 cursor-pointer bg-gray-200 p-[2px] rounded hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronDoubleRightIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}
