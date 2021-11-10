import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useCollections(term, items) {
  if (items) return { collections: items, isLoading: false, isError: false }
  const { data, error } = useSWR(`/api/collections?q=${term}`, fetcher)
  return {
    collections: data,
    isLoading: !error && !data,
    isError: error,
  }
}
