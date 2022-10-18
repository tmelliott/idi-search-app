import "tailwindcss/tailwind.css"
import "../styles/global.css"
import { useState } from "react"

import MainLayout from "../components/layout/Layout"
import PlausibleProvider from "next-plausible"
import { MDXProvider } from "@mdx-js/react"

const HeaderH2 = ({ children }) => {
  const idText = children.replace(/ /g, "_").toLowerCase()
  return <h2 id={idText}>{children}</h2>
}

const components = {
  h2: HeaderH2,
}

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
      <MDXProvider components={components}>
        <Layout>
          <Component
            {...pageProps}
            filterTerm={filterTerm}
            setFilterTerm={setFilterTerm}
          />
        </Layout>
      </MDXProvider>
    </PlausibleProvider>
  )
}

export default MyApp
