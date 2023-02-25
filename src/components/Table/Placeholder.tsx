export default function PlaceholderRows({ n, m }: { n: number; m: number }) {
  const tempArray: number[] = Array(n).fill(0);

  return (
    <>
      {[...tempArray].map((_i, i) => (
        <tr className="border-b text-sm" key={i}>
          <td className="py-1" colSpan={m}>
            <div className="animate-pulse bg-gray-100 text-gray-50">...</div>
          </td>
        </tr>
      ))}
    </>
  );
}
