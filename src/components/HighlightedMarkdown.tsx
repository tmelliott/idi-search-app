import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import rehypeRaw from "rehype-raw";

const HighlightedMarkdown = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (highlight) {
      const str = highlight
        // remove plus
        .replace(new RegExp(`[+]`, "gi"), "")
        // remove -word
        .replace(new RegExp(`[-][a-zA-Z]*`, "gi"), "")
        // replace * with regex expr
        .replace(new RegExp(`[*]`, "gi"), "[a-zA-Z]*")
        // remove surrounding whitespace
        .trim();

      console.log(str);

      const regex = new RegExp(`(${str.replaceAll(" ", "|")})`, "gi");
      const highlighted = text.replace(regex, "<mark>$1</mark>");
      setOutput(highlighted);
    } else {
      setOutput(text);
    }
  }, [highlight, text]);

  return <ReactMarkdown rehypePlugins={[rehypeRaw]}>{output}</ReactMarkdown>;
};

export default HighlightedMarkdown;
