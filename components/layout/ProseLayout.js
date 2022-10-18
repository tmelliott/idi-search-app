import { renderToString } from "react-dom/server"
import Head from "next/head"

const getHeadings = (source) => {
  const regex = /<h2>(.*?)<\/h2>/g
  if (source.match(regex)) {
    return source.match(regex).map((heading) => {
      const text = heading.replace("<h2>", "").replace("</h2>", "")
      const link = "#" + text.replace(/ /g, "_").toLowerCase()
      return { text, link }
    })
  }
  return []
}

const ProseLayout = ({ meta, children }) => {
  const contentString = renderToString(children)
  const headings = getHeadings(contentString)

  return (
    <>
      <Head>
        <title>{meta?.title || "IDI Search App"}</title>
      </Head>

      <div className="about mx-auto py-2 flex flex-col max-w-3xl lg:max-w-none lg:flex-row gap-8 justify-center lg:h-full">
        <div className="flex flex-col px-4 prose-ul:list-none prose-ul:list-outside h-full rounded bg-gray-100 p-4 w-full lg:w-[320px] text-slate-900 shadow">
          <h4 className="text-lg font-bold mb-4 text-gray-800">
            Table of Contents
          </h4>
          <div className="flex flex-col gap-2">
            {headings.map((heading) => (
              <div key={heading.text} className="">
                <a
                  className="text-gray-800 font-semibold hover:underline"
                  href={heading.link}
                >
                  {heading.text}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="prose  prose-blue max-w-3xl lg:overflow-x-scroll">
          {children}
        </div>
      </div>
    </>
  )
}

export default ProseLayout
