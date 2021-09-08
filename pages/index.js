import Head from "next/head"
import Search from "../components/Search"
import VariableTable from "../components/VariableTable"

export default function Home() {
  return (
    <div>
      <div>
        {/* Input panel */}
        <Search />
        <VariableTable />
      </div>

      <div>{/* Output/info panel */}</div>
    </div>
  )
}
