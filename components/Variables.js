import Variable from "./Variable"

function Variables({ variables, action, title = "Variables" }) {
  const showVariable = (d_id, v_id) => {
    action(<Variable d_id={d_id} v_id={v_id} action={action} />)
  }
  return (
    <section>
      <h3>
        {title} ({variables.length})
      </h3>{" "}
      <ul>
        {variables.map((variable) => (
          <li key={variable.variable_id}>
            <span
              className="cursor-pointer"
              onClick={() =>
                showVariable(variable.dataset_id, variable.variable_id)
              }
            >
              {variable.variable_id}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Variables
