import Head from "next/head";

const HEAD_DATA = {
  title: "IDI Search | What's in the IDI?",
  description: "A tool for exploring the data available in New Zealand's IDI.",
  url: "https://idisearch.terourou.org/",
  image: "https://idisearch.terourou.org/banner.png",
};

export default function HeadTags() {
  return (
    <Head>
      {/* <!-- Primary Meta Tags --> */}
      <title>{HEAD_DATA.title}</title>
      <meta name="title" content={HEAD_DATA.title} />
      <meta name="description" content={HEAD_DATA.description} />

      {/* <!-- Open Graph / Facebook --> */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={HEAD_DATA.url} />
      <meta property="og:title" content={HEAD_DATA.title} />
      <meta property="og:description" content={HEAD_DATA.description} />
      <meta property="og:image" content={HEAD_DATA.image} />

      {/* <!-- Twitter --> */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={HEAD_DATA.url} />
      <meta property="twitter:title" content={HEAD_DATA.title} />
      <meta property="twitter:description" content={HEAD_DATA.description} />
      <meta property="twitter:image" content={HEAD_DATA.image} />
    </Head>
  );
}
