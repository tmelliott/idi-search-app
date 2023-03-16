import ReactMarkdown from "react-markdown";

import { type InferGetStaticPropsType, type GetStaticProps } from "next";

import { readFileSync } from "fs";
import matter from "gray-matter";
import { join } from "path";
import rehypeRaw from "rehype-raw";

export default function Changes({
  log,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="prose prose-sm mx-auto">
      <section className="max-w-5xl">
        <h1>IDI Search Changelog</h1>
        <hr className="border-gray-100 mb-3" />

        <div className="">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{log}</ReactMarkdown>
        </div>
      </section>
    </div>
  );
}

export const getStaticProps: GetStaticProps = () => {
  const fileName = join(process.cwd(), "changelog.md");
  const fileContents = readFileSync(fileName, "utf8");
  const content = matter(fileContents);
  return {
    props: {
      log: content.content,
    },
  };
};
