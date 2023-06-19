import Link from "next/link";

import dayjs from "dayjs";
import { api } from "~/utils/api";

const LandingPage = () => {
  console.log(process.env.NEXT_PUBLIC_UPDATED_AT);
  const { data: info } = api.db_info.get.useQuery();
  const stats = info
    ? [
        {
          name: "App updated",
          value: dayjs(process.env.NEXT_PUBLIC_UPDATED_AT).format(
            "D MMMM YYYY"
          ),
        },
        {
          name: "Database updated",
          value: dayjs(info.db_updated).format("D MMMM YYYY"),
        },
        { name: "Latest refresh", value: info.db_refresh },
      ]
    : [];

  return (
    <div className="prose">
      <h2 className="">Welcome to the IDI Search App</h2>
      <p>
        The IDI Search App is a tool for searching and browsing the data
        contained within the Stats NZ IDI. For help navigating the app, click{" "}
        <strong>Help</strong> in the top right corner.
      </p>
      <p>
        Use the search box to enter terms to filter. To search multiple terms,
        prefix each word with a plus (+) sign. For example, to search for
        records that contain both the words &ldquo;income&rdquo; and
        &ldquo;employment&rdquo;, enter &ldquo;+income +employment&rdquo;. See
        Help for more information.
      </p>
      <hr />
      <table className="ml-8">
        <tbody>
          {stats &&
            stats.map((stat) => (
              <tr className="border-0" key={stat.name}>
                <td className="w-0 py-0 whitespace-nowrap text-right font-bold">
                  {stat.name}
                </td>
                <td className="py-0">
                  {stat.value}{" "}
                  {stat.name === "App updated" && (
                    <Link href="/changes" className="text-xs text-gray-500">
                      see changelog
                    </Link>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default LandingPage;
