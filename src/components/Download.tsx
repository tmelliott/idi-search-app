import { useEffect, useRef, useState } from "react";

import { CloudArrowDownIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { type agencies } from "@prisma/client";
import { type ArrayElement } from "~/types/types";
import { api, type RouterOutputs } from "~/utils/api";

type Collection = ArrayElement<RouterOutputs["collections"]["all"]>;
type Dataset = ArrayElement<RouterOutputs["datasets"]["all"]>;

type DownloadType = {
  data: agencies[] | Collection[] | Dataset[] | "variables";
  query?: {
    term: string | undefined;
    include: string;
    exact: boolean;
    dataset_id: string | undefined;
    sort: "name" | "order";
  };
};

function isAgencies(data: DownloadType["data"]): data is agencies[] {
  if (typeof data === "string") return false;
  if (!data[0]) return false;
  return data[0].hasOwnProperty("agency_id");
}
function isCollections(data: DownloadType["data"]): data is Collection[] {
  if (typeof data === "string") return false;
  if (!data[0]) return false;
  return data[0].hasOwnProperty("collection_id");
}
function isDatasets(data: DownloadType["data"]): data is Dataset[] {
  if (typeof data === "string") return false;
  if (!data[0]) return false;
  return data[0].hasOwnProperty("dataset_id");
}
function isVariables(data: DownloadType["data"]): data is "variables" {
  return data === "variables";
}

const Download = ({ data, query }: DownloadType) => {
  const [downloading, setDownloading] = useState(false);

  const {
    data: varData,
    status,
    fetchStatus,
    refetch,
  } = api.variables.all.useQuery(
    {
      term: query?.dataset_id ? undefined : query?.term,
      include: query?.include,
      exact: query?.exact,
      dataset_id: query?.dataset_id,
      sort: query?.sort,
    },
    {
      enabled: false,
    }
  );
  const state =
    useRef<(value: string | PromiseLike<string>) => void | undefined>();

  useEffect(() => {
    if (!state.current) return;
    if (status === "success" && fetchStatus === "idle") {
      void state.current("success");
      state.current = undefined;
    } else if (status === "error") {
      state.current(Promise.reject(new Error("failure")));
      state.current = undefined;
    }
  }, [status, fetchStatus]);

  function getVariableData(): Promise<string> {
    return new Promise<string>((resolve) => {
      state.current = resolve;
      void refetch();
    });
  }

  const downloadCsv = async () => {
    setDownloading(true);

    let headers: string[] = [];
    let rows: string[][] = [];
    let name = "";

    if (isVariables(data)) {
      await getVariableData();
      if (varData && varData.variables && varData.variables.length) {
        name = "variables";
        headers = ["variable_id", "variable_name", "dataset_id", "description"];
        rows = varData.variables.map((d) => [
          d.variable_id,
          d.variable_name || "",
          d.dataset_id,
          d.description ? '"' + d.description + '"' : "",
        ]);
      }
    }

    // if data is an agencies array
    if (isAgencies(data)) {
      name = "agencies";
      headers = ["agency_id", "agency_name"];
      rows = data.map((d) => [d.agency_id, d.agency_name || ""]);
    }

    if (isCollections(data)) {
      name = "collections";
      headers = [
        "collection_id",
        "collection_name",
        "description",
        "agency_name",
      ];
      rows = data.map((d) => [
        d.collection_id,
        d.collection_name || "",
        d.description ? '"' + d.description + '"' : "",
        d.agency?.agency_name || "",
      ]);
    }

    if (isDatasets(data)) {
      name = "datasets";
      headers = [
        "dataset_id",
        "dataset_name",
        "collection_name",
        "agency_name",
        "description",
      ];
      rows = data.map((d) => [
        d.dataset_id,
        d.dataset_name || "",
        d.collection?.collection_name || "",
        d.collection?.agency?.agency_name || "",
        d.description ? '"' + d.description + '"' : "",
      ]);
    }

    if (!headers.length || !rows.length) return;

    const csvData = rows.map((row) => {
      return row.join(",");
    });
    const csvHeaders = headers.join(",");
    downloadFile({
      data: [csvHeaders, ...csvData].join("\n"),
      fileName: `idi-search-results-${name}.csv`,
      fileType: "text/csv",
    });
    setDownloading(false);
  };

  const downloadJson = async () => {
    setDownloading(true);
    let name = "",
      dataString = "";
    if (isVariables(data)) {
      await getVariableData();
      if (varData && varData.variables && varData.variables.length) {
        name = "variables";
        dataString = JSON.stringify(varData.variables);
      }
    } else {
      dataString = JSON.stringify(data);
    }
    if (isAgencies(data)) {
      name = "agencies";
    }
    if (isCollections(data)) {
      name = "collections";
    }
    if (isDatasets(data)) {
      name = "datasets";
    }

    downloadFile({
      data: dataString,
      fileName: `idi-search-results-${name}.json`,
      fileType: "text/json",
    });
    setDownloading(false);
  };

  return (
    <div className="flex items-center gap-2 text-xs mr-4">
      {downloading ? (
        <Cog6ToothIcon className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <CloudArrowDownIcon className="w-4 h-4" />
          <span onClick={() => void downloadCsv()} className="cursor-pointer">
            CSV
          </span>
          <span onClick={() => void downloadJson()} className="cursor-pointer">
            JSON
          </span>
        </>
      )}
    </div>
  );
};

export default Download;

type DownloadFileProps = {
  data: string;
  fileName: string;
  fileType: string;
};

const downloadFile = ({ data, fileName, fileType }: DownloadFileProps) => {
  // Create a blob with the data we want to download as a file
  const blob = new Blob([data], { type: fileType });
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement("a");
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
};
