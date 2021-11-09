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
  if (results) console.log(results)
  return (
    <section>
      <h3>
        {title} ({isLoading ? <Loading /> : results.length})
      </h3>{" "}
      {!isLoading && (
        <div className="app-table">
          <table>
            <thead>
              <th scope="col">Name</th>
              <th scope="col">Dataset</th>
            </thead>
            <tbody>
              {results?.slice(0, limit).map((variable) => (
                <tr
                  className="clickable"
                  onClick={() =>
                    showVariable(variable.dataset_id, variable.variable_id)
                  }
                >
                  <td>
                    <div className="flex flex-col items-start">
                      <div>
                        {variable.variable_name || variable.variable_id}
                      </div>
                      {variable.variable_name !== undefined && (
                        <div className="text-xxs font-mono">
                          {variable.variable_id}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col items-start">
                      <div>{variable.dataset.dataset_name}</div>
                      <div className="text-xxs">
                        {variable.dataset.collection.collection_name},{" "}
                        {variable.dataset.collection.agency.agency_name}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {results && results.length > limit && limit > -1 && (
                <tr className="clickable">
                  <td colSpan="2" onClick={showVariables}>
                    <em>and {results.length - limit} more ...</em>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Variables
