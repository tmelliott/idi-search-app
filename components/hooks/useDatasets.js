import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useDatasets(term) {
  const { data, error } = useSWR(`/api/datasets?q=${term}`, fetcher)
  return {
    datasets: data,
    isLoading: !error && !data,
    isError: error,
  }
}
