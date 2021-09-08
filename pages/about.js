import Head from "next/head"

function about() {
  return (
    <div>
      <Head>
        <title>About | What's in the IDI?</title>
      </Head>

      <h1>IDI: Integrated Data Infrastructure</h1>

      <p>
        The IDI is New Zealand's Integrated Data Infrastructure, provided by
        Statistics NZ. It houses data from government and non-government
        sources. More information can be obtained from{" "}
        <a
          href="https://www.stats.govt.nz/integrated-data/integrated-data-infrastructure/
      "
        >
          https://www.stats.govt.nz/integrated-data/integrated-data-infrastructure/
        </a>
        .
      </p>
    </div>
  )
}

export default about
