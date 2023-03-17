import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/solid";

// const EXPORT_FORMATS = ["CSV", "JSON"];

const Search = () => {
  const router = useRouter();

  const [value, setValue] = useState("");
  const search = () => {
    const { s, ...q } = router.query;

    if (value === "" && s === undefined) return;
    if (s === value) return;

    void router.push(
      {
        pathname: router.pathname,
        query:
          value === ""
            ? q
            : {
                ...q,
                s: value,
              },
      },
      undefined,
      { shallow: true }
    );
  };

  const [showConfig, setShowConfig] = useState(false);
  const [searchRefreshes, setSearchRefreshes] = useState(true);
  const [searchAdhoc, setSearchAdhoc] = useState(true);
  useEffect(() => {
    if (!router.isReady) return;

    const { include, ...q } = router.query;

    const includes = [];
    if (!(searchRefreshes && searchAdhoc)) {
      if (searchRefreshes) includes.push("refreshes");
      if (searchAdhoc) includes.push("adhoc");
    }

    if (includes.length === 0 && include === undefined) return;
    if (include && includes.join("_") === include) return;

    void router.push(
      {
        pathname: router.pathname,
        query:
          includes.length === 0
            ? q
            : {
                ...q,
                include: includes.join("_"),
              },
      },
      undefined,
      { shallow: true }
    );
  }, [searchRefreshes, searchAdhoc, router]);

  const [exactSearch, setExactSearch] = useState(false);
  useEffect(() => {
    if (!router.isReady) return;

    const { exact, ...q } = router.query;
    if (exactSearch === (exact === "true")) return;

    void router.push(
      {
        pathname: router.pathname,
        query: exactSearch
          ? {
              ...q,
              exact: "true",
            }
          : q,
      },
      undefined,
      { shallow: true }
    );
  }, [exactSearch, router]);

  return (
    <div className="@container">
      <form
        className="border border-gray-400 rounded flex flex-col @md:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        <div className="bg-gray-400 hidden @md:flex py-2 px-3 justify-center items-center">
          <FunnelIcon className="h-5 text-gray-50 group-focus-within:text-black" />
        </div>
        <div className="flex-1">
          <input
            value={value}
            type="text"
            className={`bg-transparent focus:outline-none px-2 py-2 h-full w-full flex-1 ${
              ""
              // disabled ? "text-gray-600" : "text-black"
            }`}
            placeholder="Enter search term to filter results"
            onChange={(e) => setValue(e.target.value)}
            // disabled={disabled}
          />
        </div>
        <div className="flex bg-gray-200 border-t border-t-gray-400 @md:border-t-0">
          <button
            className="bg-gray-300 px-2 @md:px-4 py-2 flex-1 @md:border-l border-l-gray-400 hover:bg-gray-400"
            // disabled={disabled}
            type="submit"
          >
            Search
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-2 @md:px-4 bg-gray-300 border-l border-l-gray-400 hover:bg-gray-400"
            onClick={() => {
              setValue("");
              search();
            }}
          >
            Clear
          </button>
          <button
            className="flex items-center justify-center px-2 @lg:px-4 bg-gray-300 border-l border-l-gray-400 hover:bg-gray-400"
            onClick={() => setShowConfig((prev) => !prev)}
          >
            {showConfig ? (
              <XMarkIcon className="h-6 w-10" />
            ) : (
              <Cog8ToothIcon className="h-6 w-10" />
            )}
          </button>
        </div>
      </form>

      {showConfig && (
        <div className="text-xs border rounded mt-6 relative py-4 mx-2">
          <p className="font-bold absolute top-0 -translate-y-1/2 bg-white px-2 text-gray-800">
            Advanced search configuration
          </p>

          <div className="flex flex-col @lg:flex-row px-4 gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-bold">Include results from:</p>
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={searchRefreshes}
                  onChange={(e) => setSearchRefreshes(e.target.checked)}
                />{" "}
                Refreshes
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={searchAdhoc}
                  onChange={(e) => setSearchAdhoc(e.target.checked)}
                />{" "}
                Adhoc
              </div>
            </div>

            <div className="flex flex-col gap-1 @lg:border-l @lg:pl-4">
              <p className="font-bold">Exact search:</p>
              <div className="flex gap-2 items-start">
                <input
                  type="checkbox"
                  checked={exactSearch}
                  onChange={(e) => setExactSearch(e.target.checked)}
                />{" "}
                Only show results that exactly match the search string
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
