import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Bars3Icon } from "@heroicons/react/24/outline";

import packageJson from "../../../package.json";
import menuItems from "./MenuItems";

function Header() {
  const [menuHidden, setMenuHidden] = useState(true);

  const toggleMenu = () => {
    setMenuHidden(!menuHidden);
  };

  return (
    <header className="header flex flex-col sm:flex-row items-center">
      {/* Left panel */}
      <div className="flex flex-row items-center w-full sm:w-auto">
        <div className="flex-1 flex items-center gap-5">
          <h1 className="text-xl p-0 m-0 cursor-pointer">
            <Link href="/">
              <div className="flex items-center">
                <Image src="/logo.svg" height={50} width={50} alt="Logo" />
                IDI Search
              </div>
            </Link>
          </h1>
          <div className="text-xs text-gray-500 font-light hover:text-gray-700">
            <Link href="/changes">version {packageJson.version}</Link>
          </div>
        </div>
        <Bars3Icon
          className={`h-6 sm:hidden cursor-pointer ${
            menuHidden ? "" : "rotate-90"
          } transition-all`}
          onClick={toggleMenu}
        />
      </div>

      {/* Right panel */}
      <div
        className={`flex overflow-hidden transition-all ${
          menuHidden ? "h-0 opacity-0" : "h-10 opacity-100"
        } sm:h-10 sm:opacity-100 justify-end`}
      >
        {menuItems.map(({ name, href, Icon }) => (
          <Link href={href} key={name}>
            <span className="link">
              <Icon />
              {name}
            </span>
          </Link>
        ))}
      </div>
    </header>
  );
}

export default Header;
