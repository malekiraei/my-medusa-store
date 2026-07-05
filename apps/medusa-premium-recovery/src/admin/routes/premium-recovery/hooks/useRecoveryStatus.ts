import { useState, useEffect, useCallback } from "react"

import { sdk } from "../../../lib/client"
import type { SystemStatusUI } from "../types/recovery.types"

export const useRecoveryStatus = () => {
  const [status, setStatus] = useState<SystemStatusUI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await sdk.client.fetch<any>("/admin/premium-recovery/status")

      setStatus({
        protection_level: data.protection?.level ?? "unprotected",
        protection_message: data.protection?.message ?? "",
        branch: data.git?.branch ?? "main",
        latest_snapshot: data.recovery?.latest_snapshot ?? null,
        bundle_count: data.recovery?.bundle_count ?? 0,
        safety_active: data.protection?.safety_active ?? false,
        git_available: data.git?.available ?? false,
        is_clean: data.git?.clean ?? true,
        last_successful_restore: data.recovery?.last_successful_restore ?? null,
        changed_files_count: data.recovery?.changed_files_count ?? 0,
      })
    } catch (e: any) {
      setStatus(null)
      setError(e?.message || "Status fetch failed")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return { status, loading, error, refetch: fetchStatus }
}
