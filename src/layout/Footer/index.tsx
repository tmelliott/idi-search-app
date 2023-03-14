import { type ReactNode } from "react";

import Image from "next/image";

import GithubIcon from "./github.png";
import TwitterIcon from "./twitter.png";

function Footer() {
  return (
    <footer className="flex flex-col gap-3 md:flex-row justify-between items-cneter bg-gray-900 px-4 py-2 text-xs text-gray-400">
      <div className="flex flex-col gap-y-1">
        <p>
          Elliott, Milne, Li, Simpson, and Sporle (2021).{` `}
          <em>
            IDI Search:
            {` `}A web app for searching New Zealand&apos;s IDI.
          </em>
          {` `}
          <A href="https://idisearch.terourou.org">
            https://idisearch.terourou.org
          </A>
          .
        </p>
        <p>
          A collaboration by{" "}
          <A href="https://terourou.org?utm_medium=web&utm_source=idisearch&utm_content=footer">
            Te Rourou Tātaritanga
          </A>
          ,{` `}
          <A href="https://www.auckland.ac.nz/en/arts/our-research/research-institutes-centres-groups/compass.html">
            COMPASS
          </A>
          ,{` `}
          <A href="https://wgtn.ac.nz">Victoria University of Auckland</A>,{` `}
          and <A href="https://auckland.ac.nz">The University of Auckland</A>.
          Funded by <A href="https://mbie.govt.nz">MBIE</A>.
        </p>
      </div>
      <div className="flex justify-center items-center gap-4">
        <a href="https://terourou.org">
          <Image
            src="https://terourou.org/favicon.ico"
            width={20}
            height={20}
            alt="Te Rourou Tātaritanga"
          />
        </a>
        <a href="https://github.com/tmelliott/idi-search-app">
          <Image src={GithubIcon} width={20} height={20} alt="Github" />
        </a>
        <a href="https://twitter.com/terourou">
          <Image src={TwitterIcon} width={20} height={20} alt="Twitter" />
        </a>
      </div>
    </footer>
  );
}

export default Footer;

const A = ({ children, href }: { children: ReactNode; href: string }) => {
  return (
    <a href={href} className="text-blue-400 hover:text-blue-300">
      {children}
    </a>
  );
};
