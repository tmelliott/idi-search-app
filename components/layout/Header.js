import Link from "next/link"
import {
  HomeIcon,
  InformationCircleIcon,
  MenuIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline"
import { useState } from "react"

function Header() {
  const [menuHidden, setMenuHidden] = useState(true)

  const toggleMenu = () => {
    setMenuHidden(!menuHidden)
  }

  return (
    <div className="header flex flex-col sm:flex-row items-center">
      {/* Left panel */}
      <div className="flex">
        <h1 className="text-xl flex-1">What's in the IDI?</h1>
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
