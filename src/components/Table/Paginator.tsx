import { useEffect, useState } from "react";

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { type Table } from "@tanstack/react-table";

import { PulseLoader } from "../Loaders";

export default function TablePaginator<T>({
  table,
  loading,
}: {
  table: Table<T>;
  loading: boolean;
}) {
  const tablePage = table.getState().pagination.pageIndex;
  const [targetPage, setTargetPage] = useState<number | null>(tablePage + 1);

  const setPage = () => {
    if (targetPage === null) setTargetPage(tablePage + 1);
    else table.setPageIndex(targetPage - 1);
  };

  useEffect(() => {
    setTargetPage(tablePage + 1);
  }, [tablePage]);

  return (
    <div className="border-t-2 text-sm border-b-2">
      <div className="px-4 py-1 flex justify-between items-center">
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
          {loading ? (
            <PulseLoader n={3} />
          ) : table.getPageCount() ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage();
              }}
            >
              Page
              <input
                className="w-8 h-6 text-center border border-gray-300 rounded-md mx-1"
                type="text"
                value={targetPage || ""}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setTargetPage(null);
                    return;
                  }
                  const n = Number(e.target.value);
                  if (isNaN(n)) return;
                  const p = Math.min(table.getPageCount(), Math.max(1, n));
                  setTargetPage(p);
                }}
                onBlur={setPage}
              />{" "}
              of {table.getPageCount()}
            </form>
          ) : (
            <>No data</>
          )}
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
      </div>
    </div>
  );
}
