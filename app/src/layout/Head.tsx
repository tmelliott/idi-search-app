import Head from "next/head";

export default function HeadTags() {
  return (
    <Head>
      {/* <!-- Primary Meta Tags --> */}
      <title>IDI Search | What's in the IDI?</title>
      <meta name="title" content="IDI Search | What's in the IDI?" />
      <meta
        name="description"
        content="A tool for exploring the data available in New Zealand's IDI."
      />

      {/* <!-- Open Graph / Facebook --> */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://idisearch.terourou.org/" />
      <meta property="og:title" content="IDI Search | What's in the IDI?" />
      <meta
        property="og:description"
        content="A tool for exploring the data available in New Zealand's IDI."
      />
      <meta
        property="og:image"
        content="https://idisearch.terourou.org/banner.png"
      />

      {/* <!-- Twitter --> */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://idisearch.terourou.org/" />
      <meta
        property="twitter:title"
        content="IDI Search | What's in the IDI?"
      />
      <meta
        property="twitter:description"
        content="A tool for exploring the data available in New Zealand's IDI."
      />
      <meta
        property="twitter:image"
        content="https://idisearch.terourou.org/banner.png"
      />
    </Head>
  );
}
