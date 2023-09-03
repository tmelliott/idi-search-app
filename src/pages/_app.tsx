import { useEffect } from "react";

import PlausibleProvider from "next-plausible";
import { GoogleAnalytics } from "nextjs-google-analytics";

import { Layouts } from "~/layout";
import "~/styles/globals.css";
import type { NextComponentTypeWithLayout } from "~/types/types";
import { api } from "~/utils/api";

const MyApp = ({ Component, pageProps }: NextComponentTypeWithLayout) => {
  const Layout = Layouts[Component.Layout || "Main"];

  // TODO: add MDX component wrapper

  return (
    <PlausibleProvider
      domain="idisearch.terourou.org"
      customDomain="https://info.terourou.org"
      selfHosted={true}
      enabled={true}
    >
      <GoogleAnalytics trackPageViews />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PlausibleProvider>
  );
};

export default api.withTRPC(MyApp);
