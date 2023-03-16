import { type PropsWithChildren, useState, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { ArrowLeftCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Agency from "~/components/Agencies/Agency";
import Collection from "~/components/Collections/Collection";
import Dataset from "~/components/Datasets/Dataset";
import Variable from "~/components/Variables/Variable";

import MainLayout from "./MainLayout";

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
            {router.pathname !== "/" && (
              <Link href="/" className="text-sm flex items-center gap-1">
                <ArrowLeftCircleIcon className="h-5" />
                Back
              </Link>
            )}
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
                {router.query.v === "collection" && (
                  <Collection collection_id={router.query.id as string} />
                )}
                {router.query.v === "dataset" && (
                  <Dataset dataset_id={router.query.id as string} />
                )}
                {router.query.v === "variable" && (
                  <Variable
                    variable_id={router.query.id as string}
                    dataset_id={router.query.d_id as string}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default DualLayout;
