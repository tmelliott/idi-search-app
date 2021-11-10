import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useVariables(term, items) {
  if (items) return { variables: items, isLoading: false, isError: false }
  const { data, error } = useSWR(`/api/variables?q=${term}`, fetcher)
  return {
    variables: data,
    isLoading: !error && !data,
    isError: error,
  }
}
