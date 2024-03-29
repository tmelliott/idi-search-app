import { type Table, flexRender } from "@tanstack/react-table";

export default function TableHeader<T>({ table }: { table: Table<T> }) {
  return (
    <thead className="border-b-2">
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
  );
}
