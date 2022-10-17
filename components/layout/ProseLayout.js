import Head from "next/head"

const ProseLayout = ({ meta, children }) => {
  return (
    <>
      <Head>
        <title>{meta?.title || "IDI Search App"}</title>
      </Head>
      <div className="about prose prose-sm prose-blue mx-auto">{children}</div>
    </>
  )
}

export default ProseLayout
