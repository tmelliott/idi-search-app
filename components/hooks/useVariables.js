import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useVariables(
  term = "",
  include = "all",
  datasetId = "",
  page = 1,
  size = 10
) {
  const { data, error } = useSWR(
    `/api/variables?q=${term}&include=${include}&datasetId=${datasetId}&page=${page}&size=${size}`,
    fetcher
  )
  return {
    variables: data,
    isLoading: !error && !data,
    isError: error,
  }
}
