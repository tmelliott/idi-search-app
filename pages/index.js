import Head from "next/head"
import VariableTable from "../components/VariableTable"

export default function Home({ filterTerm, setFilterTerm }) {
  return (
    <div className="h-full">
      <Head>
        <title>What's in the IDI?</title>
      </Head>

      <div className="h-full flex">
        <div className="h-full vartable-container">
          <VariableTable
            filterTerm={filterTerm}
            setFilterTerm={setFilterTerm}
          />
        </div>

        <div>variable information goes here</div>
      </div>
    </div>
  )
}
