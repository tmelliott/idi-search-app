import "tailwindcss/tailwind.css"
import "../styles/global.css"
import Layout from "../components/layout/Layout"
import { useState } from "react"

function MyApp({ Component, pageProps }) {
  const [filterTerm, setFilterTerm] = useState("")

  return (
    <Layout>
      <Component
        {...pageProps}
        filterTerm={filterTerm}
        setFilterTerm={setFilterTerm}
      />
    </Layout>
  )
}

export default MyApp
