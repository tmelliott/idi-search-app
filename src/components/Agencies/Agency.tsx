import Link from "next/link";

import { CogIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";

import Collections from "../Collections";

type Props = {
  agency_id: string;
};

export default function Agency({ agency_id }: Props) {
  const {
    data: agency,
    isLoading,
    isError,
  } = api.agencies.get.useQuery({
    agency_id,
  });

  if (isLoading) return <CogIcon className="h-10 mb-4 animate-spin" />;
  if (isError)
    return (
      <p>
        Error loading agency with id <pre>{agency_id}</pre>.
      </p>
    );

  if (!agency) return <p>Agency not found.</p>;

  return (
    <div className="prose max-w-none">
      <Link href={`/agencies/${agency_id}`}>
        <h2>{agency?.agency_name}</h2>
      </Link>

      <Collections agency_id={agency_id} limit={15} />
    </div>
  );
}
