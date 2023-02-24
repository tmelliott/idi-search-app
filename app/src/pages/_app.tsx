import PlausibleProvider from "next-plausible";

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
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PlausibleProvider>
  );
};

export default api.withTRPC(MyApp);
