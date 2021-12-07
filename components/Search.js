import { FilterIcon } from "@heroicons/react/outline"
import { useRef, useState } from "react"
import { event } from "../lib/gtag"

function Search({ term, handler }) {
  const [value, setValue] = useState(term)
  const disabled = false
  const inputRef = useRef()
  return (
    <form
      className={`flex items-center p-2 mb-2 border border-gray-400 rounded group ${
        disabled ? "bg-gray-100" : "bg-white"
      }`}
      onSubmit={(e) => {
        e.preventDefault()
        event({
          action: "search_app",
          category: "Search",
          label: inputRef.current.value,
        })
        handler(inputRef.current.value)
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
        className="border rounded border-gray-800 pl-2 pr-2 ml-2"
        onClick={() => {
          setValue("")
          handler("")
        }}
      >
        Clear
      </button>
    </form>
  )
}

export default Search
