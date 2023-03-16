import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";

type Props = {
  refreshes: {
    refresh: string;
    available: boolean;
  }[];
};

function Refreshes({ refreshes }: Props) {
  return (
    <div>
      <h4>Refresh availability</h4>
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-y-2">
        {refreshes
          .sort((a, b) =>
            dayjs(a.refresh, "YYYYMMDD") < dayjs(b.refresh, "YYYYMMDD") ? 1 : -1
          )
          .map((r) => (
            <div
              key={r.refresh}
              className={`px-2 mr-2 ${
                r.available
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              } border-2 flex items-center text-sm py-1`}
            >
              {r.available ? (
                <CheckCircleIcon className="h-4 mr-2" />
              ) : (
                <XCircleIcon className="h-4 mr-1" />
              )}
              {dayjs(r.refresh, "YYYYMMDD").format("MMM YYYY")}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Refreshes;
