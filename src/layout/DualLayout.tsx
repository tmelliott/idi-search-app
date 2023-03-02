// import Footer from "./Footer"
// import Header from "./Header"
import { type PropsWithChildren, useState, useEffect } from "react";

import { useRouter } from "next/router";

import { XCircleIcon } from "@heroicons/react/24/outline";
import Agency from "~/components/Agencies/Agency";

import MainLayout from "./MainLayout";

const components = [
  {
    value: "agency",
    component: Agency,
  },
  // {
  //   value: "collection",
  //   component: Collection,
  // },
  // {
  //   value: "dataset",
  //   component: Dataset,
  // },
  // {
  //   value: "variable",
  //   component: Variable,
  // },
];

const DualLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const [info, setInfo] = useState(false);

  useEffect(() => {
    const { v } = router.query;
    setInfo(v ? true : false);
  }, [router.query]);

  return (
    <MainLayout>
      <div className="h-full">
        <div className="md:h-full flex md:overflow-x-hidden">
          <div className="flex-1 overflow-y-scroll">
            {/* <Search /> */}
            {children}
          </div>

          <div
            className={`flex-1 p-4 shadow-md bg-gray-50 overflow-x-hidden ${
              info ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
            } transition fixed top-0 left-0 w-full md:overflow-y-scroll scrollbar-hide md:scrollbar-default
          h-full pt-4 md:static md:w-auto md:h-full md:top-auto md:left-auto`}
          >
            {info && (
              <>
                <div className="flex flex-row justify-end w-full">
                  <div
                    className="flex flex-row text-xs items-center cursor-pointer hover:opacity-70"
                    onClick={() => setInfo(false)}
                  >
                    Close
                    <XCircleIcon className="h-6 ml-2" />
                  </div>
                </div>

                {router.query.v === "agency" && (
                  <Agency agency_id={router.query.id as string} />
                )}

                {/* {type === "agency" && <Agency id={typeId} />}
                {type === "collection" && <Collection id={typeId} />}
                {type === "dataset" && <Dataset id={typeId} />}
                {type === "variable" && (
                  <Variable d_id={router.query.d} v_id={typeId} />
                )} */}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default DualLayout;
