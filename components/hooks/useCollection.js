import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useCollection(id) {
  const { data, error } = useSWR(`/api/collections/${id}`, fetcher)
  return {
    collection: data,
    isLoading: !error && !data,
    isError: error,
  }
}
