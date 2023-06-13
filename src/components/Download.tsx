import { CloudArrowDownIcon } from "@heroicons/react/24/outline";
import { agencies } from "@prisma/client";
import { type ArrayElement } from "~/types/types";
import { type RouterOutputs } from "~/utils/api";

type Collection = ArrayElement<RouterOutputs["collections"]["all"]>;
type Dataset = ArrayElement<RouterOutputs["datasets"]["all"]>;

type DownloadType = {
  data: agencies[] | Collection[] | Dataset[] | "variables";
};

function isAgencies(data: any): data is agencies[] {
  return data[0].hasOwnProperty("agency_id");
}
function isCollections(data: any): data is Collection[] {
  return data[0].hasOwnProperty("collection_id");
}
function isDatasets(data: any): data is Dataset[] {
  return data[0].hasOwnProperty("dataset_id");
}

const Download = ({ data }: DownloadType) => {
  if (data === "variables") {
    return <>(not ready)</>;
  }

  const downloadCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let name = "";

    if (typeof data === "string" && data === "variables") {
      name = "variables";
      return;
    }

    if (!data[0]) return;

    // if data is an agencies array
    if (isAgencies(data)) {
      name = "agencies";
      headers = ["agency_id", "agency_name"];
      rows = data.map((d) => [d.agency_id, d.agency_name || ""]);
    } else if (isCollections(data)) {
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
    } else if (isDatasets(data)) {
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
    } else {
      return;
    }

    const csvData = rows.map((row) => {
      return row.join(",");
    });
    const csvHeaders = headers.join(",");
    downloadFile({
      data: [csvHeaders, ...csvData].join("\n"),
      fileName: `idi-search-results-${name}.csv`,
      fileType: "text/csv",
    });
  };

  const downloadJson = () => {
    let name = "";
    if (typeof data === "string" && data === "variables") {
      name = "variables";
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
      data: JSON.stringify(data),
      fileName: `idi-search-results-${name}.json`,
      fileType: "text/json",
    });
  };

  return (
    <div className="flex items-center gap-2 text-xs mr-4">
      <CloudArrowDownIcon className="w-4 h-4" />
      <span onClick={downloadCsv} className="cursor-pointer">
        CSV
      </span>
      <span onClick={downloadJson} className="cursor-pointer">
        JSON
      </span>
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
