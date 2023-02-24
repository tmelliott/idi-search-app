import Link from "next/link";
import { useRouter } from "next/router";

import { XCircleIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";

type Props = {
  limit?: number;
};

export default function Agencies({ limit }: Props) {
  const { query } = useRouter();
  const {
    data: agencies,
    isFetching,
    isError,
  } = api.agencies.all.useQuery({
    term: query.s as string,
    limit,
  });

  // define headers

  // define rows

  // use tanstack table to display results!

  return (
    <section>
      <h3>Data Supply Agencies</h3>

      {isError ? (
        <p className="flex items-center text-red-600 text-sm my-2">
          <XCircleIcon className="w-5 h-5 mr-2" />
          Failed to load agencies - please refresh the page and contact us if
          the problem persists.
        </p>
      ) : isFetching ? (
        <div className="m-2">
          <div className="font-bold border-b">Name</div>
          {[...Array(limit ? limit : 3)].map((i) => (
            <div className="animate-pulse py-1 border-b" key={i}>
              <div className="bg-gray-50 text-gray-100">...</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="m-2">
          <div className="font-bold border-b">Name</div>
          {agencies?.map((agency) => (
            <div key={agency.agency_id} className="py-1 border-b text-sm">
              <Link href={`/agencies/${agency.agency_id}`}>
                {agency.agency_name}
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
