type Props = {
  text: string | null | undefined;
  subtext?: string | null | undefined;
  style?: "id" | "name";
};

export default function TableCell({ text, subtext, style }: Props) {
  return (
    <div>
      <div className="whitespace-nowrap overflow-ellipsis overflow-hidden">
        {text}
      </div>
      {subtext && (
        <div
          className={`text-xs whitespace-nowrap overflow-ellipsis overflow-hidden ${
            style === "id" ? "text-gray-500 font-mono" : ""
          }`}
        >
          {subtext}
        </div>
      )}
    </div>
  );
}
