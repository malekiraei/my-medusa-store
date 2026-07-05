import { useState, useEffect, useCallback } from "react"

import { sdk } from "../../../lib/client"

export type BundleInfo = {
  id: string
  name: string
  description: string
  version: string
  status: string
  created_at: string
}

export const useBundles = () => {
  const [bundles, setBundles] = useState<BundleInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBundles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await sdk.client.fetch<any>("/admin/premium-recovery/bundles")
      setBundles(data?.bundles ?? [])
    } catch (e: any) {
      setError(e.message)
      setBundles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBundles()
  }, [fetchBundles])

  return { bundles, loading, error, refetch: fetchBundles }
}
