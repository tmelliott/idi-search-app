import { FilterIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"

function Search() {
  const router = useRouter()
  const [value, setValue] = useState("")
  const disabled = false
  const inputRef = useRef()

  useEffect(() => {
    setValue(router.query.s || "")
  }, [router.query])

  const updateQuery = () => {
    const { s, ...rest } = router.query
    let q = { ...router.query, s: value }
    if (value === "") q = rest
    router.push(
      {
        pathname: router.pathname,
        query: q,
      },
      undefined,
      { shallow: true }
    )
  }

  return (
    <form
      className={`flex items-center p-2 mb-2 border border-gray-400 rounded group ${
        disabled ? "bg-gray-100" : "bg-white"
      }`}
      onSubmit={(e) => {
        e.preventDefault()
        updateQuery()
      }}
    >
      <FilterIcon className="h-5 mr-2 text-gray-400 group-focus-within:text-black" />
      <input
        value={value}
        type="text"
        ref={inputRef}
        className={`bg-transparent focus:outline-none w-full ${
          disabled ? "text-gray-600" : "text-black"
        }`}
        placeholder="Enter search term to filter results"
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button
        className="border rounded bg-gray-100 pl-2 pr-2 hover:bg-gray-200"
        disabled={disabled}
        type="submit"
      >
        Search
      </button>
      <button
        type="submit"
        className="border rounded border-gray-800 pl-2 pr-2 ml-2"
        onClick={() => {
          setValue("")
        }}
      >
        Clear
      </button>
    </form>
  )
}

export default Search
