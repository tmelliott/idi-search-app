import { useRouter } from "next/router"
import Head from "next/head"
import DualLayout from "../../components/layout/DualLayout"
import Collection from "../../components/Collection"
import useCollection from "../../components/hooks/useCollection"

function CollectionPage() {
  const router = useRouter()
  const filterTerm = router.query.s || ""
  const id = router.query.collection
  const { collection, isLoading } = useCollection(id)

  return (
    <>
      <Head>
        <title>
          {isLoading ? id : collection.collection_name} | Collection | IDI
          Search
        </title>
      </Head>

      <Collection id={id} term={filterTerm} />
    </>
  )
}

CollectionPage.Layout = DualLayout

export default CollectionPage
