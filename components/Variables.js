import Variable from "./Variable"
import useVariables from "./hooks/useVariables"
import Loading from "./Loading"

function Variables({ variables, action, term, limit, title = "Variables" }) {
  const { variables: results, isLoading } = variables.length
    ? { variables: variables, isLoading: false }
    : useVariables(term)
  const showVariable = (d_id, v_id) => {
    action(<Variable d_id={d_id} v_id={v_id} action={action} />)
  }
  const showVariables = () => {
    action(<Variables variables={variables} action={action} term={term} />)
  }
  if (!limit) limit = results ? results.length : 0
  return (
    <section>
      <h3>
        {title} ({isLoading ? <Loading /> : results.length})
      </h3>{" "}
      <ul>
        {results?.slice(0, limit).map((variable) => (
          <li key={variable.id}>
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
        {results && results.length > limit && limit > -1 && (
          <li>
            <span className="cursor-pointer" onClick={showVariables}>
              <em>and {results.length - limit} more ...</em>
            </span>
          </li>
        )}
      </ul>
    </section>
  )
}

export default Variables
