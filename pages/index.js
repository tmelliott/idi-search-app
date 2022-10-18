import Head from "next/head"
import { useRouter } from "next/router"

import Agencies from "../components/Agencies"
import Collections from "../components/Collections"
import Datasets from "../components/Datasets"
import Variables from "../components/Variables"

import DualLayout from "../components/layout/DualLayout"

function Home() {
  const router = useRouter()
  const filterTerm = router.query.s || ""
  const filterInclude = router.query.include || "all"

  return (
    <>
      <Head>
        <title>IDI Search | What's in the IDI?</title>
        <meta
          name="description"
          content="A tool for exploring the data available in New Zealand's IDI"
        />
      </Head>

      <Agencies term={filterTerm} limit={2} />
      <Collections term={filterTerm} limit={3} />
      <Datasets term={filterTerm} limit={5} />
      <Variables
        term={filterTerm}
        include={filterInclude}
        limit={10}
        linkTo="/variables"
      />
    </>
  )
}

Home.Layout = DualLayout

export default Home
