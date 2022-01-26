import { useRouter } from "next/router"
import React from "react"

function AgencyPage() {
  const router = useRouter()
  const { agency } = router.query
  return <div>{agency}</div>
}

export default AgencyPage
