import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useAgencies(term) {
  const { data, error } = useSWR(`/api/agencies?q=${term}`, fetcher)
  return {
    agencies: data,
    isLoading: !error && !data,
    isError: error,
  }
}
