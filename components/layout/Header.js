import Link from "next/link"
import {
  ChartBarIcon,
  HomeIcon,
  InformationCircleIcon,
  MenuIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline"
import { useState } from "react"

import packageJson from "../../package.json"

function Header() {
  const [menuHidden, setMenuHidden] = useState(true)

  const toggleMenu = () => {
    setMenuHidden(!menuHidden)
  }

  return (
    <div className="header flex flex-col sm:flex-row items-center">
      {/* Left panel */}
      <div className="flex flex-row items-center w-full sm:w-auto">
        <div className="flex-1 flex items-baseline gap-5">
          <h1 className="text-xl p-0 m-0">
            <Link href="/">
              <a>IDI Search</a>
            </Link>
          </h1>
          <div className="text-xs text-gray-500 font-light hover:text-gray-700">
            <Link href="/changes">
              <a>version {packageJson.version}</a>
            </Link>
          </div>
        </div>
        <MenuIcon
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
        <Link href="/">
          <a className="link">
            <HomeIcon />
            Home
          </a>
        </Link>
        <Link href="/about">
          <a className="link">
            <InformationCircleIcon className="" />
            About
          </a>
        </Link>
        <Link href="/stats">
          <a className="link">
            <ChartBarIcon className="" />
            Quick Stats
          </a>
        </Link>
        <Link href="/help">
          <a className="link">
            <QuestionMarkCircleIcon className="h-5 mr-1" />
            Help
          </a>
        </Link>
      </div>
    </div>
  )
}

export default Header
