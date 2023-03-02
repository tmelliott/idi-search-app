import { type ReactNode } from "react";

type Props = {
  text: string | ReactNode | null | undefined;
  subtext?: string | null | undefined;
  style?: "id" | "name";
  indicator?: "none" | "success" | "warning" | "error";
};

export default function TableCell({
  text,
  subtext,
  style,
  indicator = "none",
}: Props) {
  return (
    <div className="flex items-center gap-2 pr-2">
      <div className="flex-1 whitespace-nowrap overflow-ellipsis overflow-hidden">
        <div className="">{text}</div>
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

      {indicator === "success" && (
        <div className="h-2 w-2 rounded-full bg-green-400"></div>
      )}
      {indicator === "warning" && (
        <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
      )}
      {indicator === "error" && (
        <div className="h-2 w-2 rounded-full bg-red-400"></div>
      )}
    </div>
  );
}
