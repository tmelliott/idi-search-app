import "tailwindcss/tailwind.css"
import "../styles/global.css"
import Layout from "../components/layout/Layout"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { pageview } from "../components/ga"

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [filterTerm, setFilterTerm] = useState("")

  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url)
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
