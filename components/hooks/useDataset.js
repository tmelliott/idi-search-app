import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useDataset(id) {
  const { data, error } = useSWR(`/api/datasets/${id}`, fetcher)
  return {
    dataset: data,
    isLoading: !error && !data,
    isError: error,
  }
}
