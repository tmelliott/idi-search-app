import Link from "next/link"
import {
  HomeIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline"

function Header() {
  return (
    <div className="header">
      {/* Left panel */}
      <div>
        <h1 className="text-xl">What's in the IDI?</h1>
      </div>

      {/* Right panel */}
      <div>
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
