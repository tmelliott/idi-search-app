import useSWR from "swr"
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useCollections(term = "", agencyId = "") {
  const { data, error } = useSWR(
    `/api/collections?q=${term}&agencyId=${agencyId}`,
    fetcher
  )
  return {
    collections: data,
    isLoading: !error && !data,
    isError: error,
  }
}
