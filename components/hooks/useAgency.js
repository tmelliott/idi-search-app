import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useAgency(id) {
  const { data, error } = useSWR(`/api/agencies/${id}`, fetcher)
  return {
    agency: data,
    isLoading: !error && !data,
    isError: error,
  }
}
