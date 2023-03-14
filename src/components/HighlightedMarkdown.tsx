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
      const regex = new RegExp(`(${highlight.replaceAll(" ", "|")})`, "gi");
      const highlighted = text.replace(regex, "<mark>$1</mark>");
      setOutput(highlighted);
    } else {
      setOutput(text);
    }
  }, [highlight]);

  return <ReactMarkdown rehypePlugins={[rehypeRaw]}>{output}</ReactMarkdown>;
};

export default HighlightedMarkdown;
