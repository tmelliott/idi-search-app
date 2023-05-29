import React, { useState } from "react";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";

type Props = {
  variable_id: string;
};

function CodeValues({ variable_id }: Props) {
  const [showLinkInfo, setShowLinkInfo] = useState(false);
  const { data } = api.variables.codes.useQuery({ variable_id });

  if (!data || data.length === 0) return <></>;

  return (
    <div>
      <h4 className="flex items-center">
        Value Codes
        <InformationCircleIcon
          className="h-4 w-4 ml-2 cursor-pointer hover:text-blue-700"
          onMouseEnter={() => setShowLinkInfo(true)}
          onMouseLeave={() => setShowLinkInfo(false)}
        />
      </h4>
      <div className="relative">
        {showLinkInfo && (
          <p className="absolute bg-gray-100 px-4 py-2 my-0 shadow z-20">
            This value is coded. The table below shows the codes as they are
            stored in the database, and the corresponding labels.
          </p>
        )}
      </div>

      <div className="max-h-48 overflow-y-scroll">
        <table className="table table-sm m-0">
          <thead className="sticky top-0 bg-gray-300">
            <tr>
              <th className="px-2 py-1">Code</th>
              <th className="px-2 py-1">Label</th>
            </tr>
          </thead>
          <tbody className="">
            {data.map((code) => (
              <tr key={code.code}>
                <td className="px-2">{code.code}</td>
                <td className="px-2">{code.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CodeValues;
