import content from "../../data/tables.json"

function Table(props) {
  return (
    <div>
      <h3 className="text-lg">Agency: {props.agency}</h3>
      <h3 className="text-lg">Collection: {props.collection}</h3>
      <h3 className="text-lg mb-8">Table: {props.table_name}</h3>

      <h5 className="font-bold mb-2">SQL Info</h5>
      <p>
        <b>Schema:</b> <code>{props.schema}</code>
      </p>
      <p>
        <b>Table:</b> <code>{props.table_name}</code>
      </p>
    </div>
  )
}

async function getStaticProps({ params }) {
  const info = content.filter((tab) => tab.table_name === params.table)[0]
  console.log(info)

  return {
    props: {
      ...info,
    },
  }
}

async function getStaticPaths() {
  // list of tables in `data/tables.json`
  const tables = content.map((table) => ({
    params: { table: table.table_name },
  }))

  return {
    paths: tables,
    fallback: false,
  }
}

export default Table
export { getStaticProps, getStaticPaths }
