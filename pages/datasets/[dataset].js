import { useRouter } from "next/router"
import Head from "next/head"
import DualLayout from "../../components/layout/DualLayout"
import Dataset from "../../components/Dataset"
import useDataset from "../../components/hooks/useDataset"

function DatasetPage() {
  const router = useRouter()
  const filterTerm = router.query.s || ""
  const id = router.query.dataset
  const { dataset, isLoading } = useDataset(id)

  return (
    <>
      <Head>
        <title>
          {isLoading ? id : dataset.dataset_name} | Dataset | IDI Search
        </title>
      </Head>

      <Dataset id={id} term={filterTerm} />
    </>
  )
}

DatasetPage.Layout = DualLayout

export default DatasetPage
