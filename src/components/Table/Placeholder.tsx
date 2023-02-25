import { type ReactNode } from "react";

export default function PlaceholderRows({
  children,
  n,
  m,
}: {
  children: ReactNode;
  n: number;
  m: number;
}) {
  const tempArray = Array(n).fill(0) as number[];

  return (
    <>
      {[...tempArray].map((_i, i) => (
        <tr className="border-b text-sm" key={i}>
          <td className="py-1" colSpan={m}>
            <div className="animate-pulse bg-gray-100 text-gray-50">
              {children}
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
