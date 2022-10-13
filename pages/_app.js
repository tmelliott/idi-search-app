import "tailwindcss/tailwind.css"
import "../styles/global.css"
import { useState } from "react"

import MainLayout from "../components/layout/Layout"
import PlausibleProvider from "next-plausible"

function MyApp({ Component, pageProps }) {
  const [filterTerm, setFilterTerm] = useState("")

  const Layout = Component.Layout || MainLayout

  return (
    <PlausibleProvider
      domain="idisearch.terourou.org"
      customDomain="https://info.terourou.org"
      selfHosted="true"
      enabled="true"
    >
      <Layout>
        <Component
          {...pageProps}
          filterTerm={filterTerm}
          setFilterTerm={setFilterTerm}
        />
      </Layout>
    </PlausibleProvider>
  )
}

export default MyApp
