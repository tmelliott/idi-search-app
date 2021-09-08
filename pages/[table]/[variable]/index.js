import { CheckIcon, XIcon } from "@heroicons/react/solid"

import content from "../../../data/idi.json"

function Variable(props) {
  return (
    <div>
      <h1>{props.variable_name}</h1>

      <p>
        <b>Agency:</b> {props.agency}
      </p>
      <p>
        <b>Collection:</b> {props.collection}
      </p>

      <h5 className="font-bold mb-2 mt-8">SQL Info</h5>
      <p>
        <b>Schema:</b> <code>{props.schema}</code>
      </p>
      <p>
        <b>Table:</b> <code>{props.table_name}</code>
      </p>
      <p>
        <b>Variable name:</b> <code>{props.variable_name}</code>
      </p>

      <h5 className="font-bold mb-2 mt-8">Availability in IDI refreshes</h5>
      <div className="flex">
        {props.refreshes.map((refresh) => (
          <div
            key={refresh.date}
            className={`border p-1 pr-2 flex items-center text-xs font-bold ${
              refresh.available ? "bg-green-200" : "bg-red-200"
            }`}
          >
            {refresh.available ? (
              <CheckIcon className="h-5 mr-1 text-green-600" />
            ) : (
              <XIcon className="h-5 mr-1 text-red-600" />
            )}

            {refresh.date}
          </div>
        ))}
      </div>
    </div>
  )
}

async function getServerSideProps(context) {
  const info = content.filter(
    (tab) =>
      tab.table_name === context.query.table &&
      tab.variable_name === context.query.variable
  )

  // IDI refresh variables
  const refresh = Object.keys(info[0])
    .filter((key) => key.includes("IDI"))
    .map((key) => ({
      date:
        key.substring(3, 7) +
        "-" +
        key.substring(7, 9) +
        "-" +
        key.substring(9, 11),
      available: info[0][key],
    }))

  return {
    props: {
      schema: info[0].schema,
      table_name: info[0].table_name,
      variable_name: info[0].variable_name,
      collection: info[0].collection,
      agency: info[0].agency,
      refreshes: refresh,
    },
  }
}

// async function getStaticPaths() {
//   // list of tables in `data/tables.json`
//   const vars = content.map((variable) => ({
//     params: { table: variable.table_name, variable: variable.variable_name },
//   }))

//   return {
//     paths: vars,
//     fallback: false,
//   }
// }

export default Variable
export { getServerSideProps }
