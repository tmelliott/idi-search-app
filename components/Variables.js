import Variable from "./Variable"
import useVariables from "./hooks/useVariables"
import Loading from "./Loading"
import { useRouter } from "next/router"

function Variables({ items, action, term, limit, title = "Variables" }) {
  const router = useRouter()
  const { variables, isLoading } = useVariables(term, items)

  const showVariable = (d_id, v_id) => {
    action(<Variable d_id={d_id} v_id={v_id} action={action} />)
  }
  const showVariables = () => {
    router.push("/variables")
  }
  if (!limit) limit = variables?.length

  return (
    <section>
      <h3>
        {title} ({isLoading ? <Loading /> : variables.length})
      </h3>{" "}
      {variables?.length > 0 && (
        <div className="app-table">
          <table>
            {variables[0].agency && (
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Dataset</th>
                </tr>
              </thead>
            )}
            <tbody>
              {variables?.slice(0, limit).map((variable) => (
                <tr
                  key={variable.variable_id + variable.dataset_id}
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
                  {variable.dataset && (
                    <td>
                      <div className="flex flex-col items-start">
                        <div>{variable.dataset.dataset_name}</div>
                        <div className="text-xxs">
                          {variable.dataset.collection.collection_name},{" "}
                          {variable.dataset.collection.agency.agency_name}
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {variables && variables.length > limit && limit > -1 && (
                <tr className="clickable">
                  <td colSpan="2" onClick={showVariables}>
                    <em>and {variables.length - limit} more ...</em>
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
