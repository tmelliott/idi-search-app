import { useEffect } from "react";

import PlausibleProvider from "next-plausible";

import { Layouts } from "~/layout";
import "~/styles/globals.css";
import type { NextComponentTypeWithLayout } from "~/types/types";
import { api } from "~/utils/api";

const MyApp = ({ Component, pageProps }: NextComponentTypeWithLayout) => {
  const Layout = Layouts[Component.Layout || "Main"];

  useEffect(() => {
    // @ts-ignore
    var _mtm = (window._mtm = window._mtm || []);
    _mtm.push({ "mtm.startTime": new Date().getTime(), event: "mtm.Start" });
    (function () {
      var d = document,
        g = d.createElement("script"),
        s = d.getElementsByTagName("script")[0];
      g.async = true;
      g.src =
        "https://ec2-3-104-45-196.ap-southeast-2.compute.amazonaws.com/js/container_HJj42ra5.js";
      s?.parentNode?.insertBefore(g, s);
    })();
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
