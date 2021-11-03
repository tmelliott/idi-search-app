import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useVariable(d_id, v_id) {
  const { data, error } = useSWR(`/api/variables/${d_id}/${v_id}`, fetcher)
  return {
    variable: data,
    isLoading: !error && !data,
    isError: error,
  }
}
