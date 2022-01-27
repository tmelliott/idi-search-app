import "tailwindcss/tailwind.css"
import "../styles/global.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Script from "next/script"
import * as gtag from "../lib/gtag"

import MainLayout from "../components/layout/Layout"

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [filterTerm, setFilterTerm] = useState("")

  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }
    //When the component is mounted, subscribe to router changes
    //and log those page views
    router.events.on("routeChangeComplete", handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
    }
  }, [router.events])

  const Layout = Component.Layout || MainLayout

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Layout>
        <Component
          {...pageProps}
          filterTerm={filterTerm}
          setFilterTerm={setFilterTerm}
        />
      </Layout>
    </>
  )
}

export default MyApp
