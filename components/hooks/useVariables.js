import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useVariables(term = "", datasetId = "") {
  const { data, error } = useSWR(
    `/api/variables?q=${term}&datasetId=${datasetId}`,
    fetcher
  )
  return {
    variables: data,
    isLoading: !error && !data,
    isError: error,
  }
}
