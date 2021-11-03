import Dataset from "./Dataset"

function Datasets({ datasets, action, title = "Datasets" }) {
  const showDataset = (id) => {
    action(<Dataset id={id} action={action} />)
  }
  return (
    <section>
      <h3>
        {title} ({datasets.length})
      </h3>{" "}
      <ul>
        {datasets.map((dataset) => (
          <li key={dataset.dataset_id}>
            <span
              className="cursor-pointer"
              onClick={() => showDataset(dataset.dataset_id)}
            >
              {dataset.dataset_name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Datasets
