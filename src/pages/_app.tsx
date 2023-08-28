import { useEffect } from "react";

import PlausibleProvider from "next-plausible";

import init from "@socialgouv/matomo-next";
import { Layouts } from "~/layout";
import "~/styles/globals.css";
import type { NextComponentTypeWithLayout } from "~/types/types";
import { api } from "~/utils/api";

const MyApp = ({ Component, pageProps }: NextComponentTypeWithLayout) => {
  const Layout = Layouts[Component.Layout || "Main"];

  useEffect(() => {
    init({
      url: process.env.NEXT_PUBLIC_MATOMO_URL || "",
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID || "",
    });
  }, []);

  // TODO: add MDX component wrapper

  return (
    <PlausibleProvider
      domain="idisearch.terourou.org"
      customDomain="https://info.terourou.org"
      selfHosted={true}
      enabled={true}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PlausibleProvider>
  );
};

export default api.withTRPC(MyApp);
