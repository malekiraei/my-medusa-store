// src/admin/routes/premium-recovery/hooks/useRestorePoints.ts
// ============================================================
// useRestorePoints - با مسیرهای صحیح API
// ✅ POST به /restore-points (نه /create)
// ✅ داده‌ها به درستی parse می‌شوند
// ============================================================

import { useState, useEffect, useCallback } from "react"

import { sdk } from "../../../lib/client"
import type {
  SnapshotCreatePayload,
  SnapshotRecord,
} from "../types/snapshot-workflow"

export type RestorePoint = SnapshotRecord
export type SnapshotFormData = SnapshotCreatePayload

export const useRestorePoints = () => {
  const [points, setPoints] = useState<RestorePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ===== Fetch Restore Points =====
  const fetchPoints = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await sdk.client.fetch<any>("/admin/premium-recovery/restore-points")
      
      // ✅ پشتیبانی از چند فرمت پاسخ
      const pointsData = data?.restore_points ?? data?.data ?? data ?? []
      setPoints(Array.isArray(pointsData) ? pointsData : [])
      
      return pointsData
      
    } catch (e: any) {
      const message = e.message || "Unknown error"
      setError(message)
      console.error("❌ fetchPoints error:", message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // ===== Create Restore Point =====
  const createPoint = useCallback(async (formData: SnapshotFormData) => {
    try {
      // ✅ مسیر صحیح: /restore-points
      const result = await sdk.client.fetch<any>("/admin/premium-recovery/restore-points", {
        method: "POST",
        body: {
          name: formData.name,
          description: formData.description,
          business_context: formData.business_context,
          use_case: formData.use_case,
          files: formData.files,
        },
      })
      
      // ✅ بعد از ایجاد موفق، لیست را Refresh کن
      await fetchPoints()
      
      console.log("✅ Restore point created successfully:", result)
      return { success: true, data: result }
      
    } catch (e: any) {
      const message = e.message || "Unknown error"
      console.error("❌ createPoint error:", message)
      return { success: false, error: message }
    }
  }, [fetchPoints])

  // ===== Load initial data =====
  useEffect(() => {
    fetchPoints()
  }, [fetchPoints])

  return {
    points,
    loading,
    error,
    refetch: fetchPoints,
    createPoint,
  }
}

export default useRestorePoints
