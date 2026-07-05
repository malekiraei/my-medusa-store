// src/admin/routes/premium-recovery/hooks/useGitChanges.ts
// ============================================================
// ✅ اصلاح mapping - استفاده از status برای تشخیص نوع تغییر
// ============================================================

import { useState, useCallback, useRef } from "react"

import { sdk } from "../../../lib/client"

export type ChangedFile = {
  path: string
  status: "added" | "deleted" | "modified" | "untracked"
  business_impact?: string
}

type ApiChange = {
  path?: string
  status?: string  // ← "M ", " M", "D ", " D", "??", etc.
  type?: "added" | "deleted" | "modified"
}

// ============================================================
// تشخیص نوع تغییر از status
// ============================================================
function getChangeType(status: string): "added" | "deleted" | "modified" | "untracked" {
  if (!status) return "modified"
  
  const trimmed = status.trim()
  
  // untracked
  if (trimmed === "??") return "untracked"
  
  // added
  if (trimmed.includes("A") || trimmed === "??") return "added"
  
  // deleted
  if (trimmed.includes("D")) return "deleted"
  
  // renamed
  if (trimmed.includes("R")) return "modified"
  
  // modified (default)
  return "modified"
}

export const useGitChanges = () => {
  const [files, setFiles] = useState<ChangedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const requestVersionRef = useRef(0)

  const fetchChanges = useCallback(async () => {
    const requestVersion = ++requestVersionRef.current

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const data = await sdk.client.fetch<any>("/admin/premium-recovery/git-changes", {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      })
      console.log("📡 Git API Response:", data)

      const changes: ApiChange[] = Array.isArray(data?.changes)
        ? data.changes
        : []

      // ============================================================
      // ✅ mapping صحیح با استفاده از status
      // ============================================================
      const formatted: ChangedFile[] = changes
        .filter((c) => typeof c?.path === "string" && c.path.trim().length > 0)
        .map((change) => {
          const status = change.status || ""
          const type = getChangeType(status)
          
          return {
            path: change.path!,
            status: type === "untracked" ? "untracked" : type,
            business_impact: "normal",
          }
        })

      console.log(`✅ ${formatted.length} files mapped`)

      if (requestVersion === requestVersionRef.current) {
        setFiles(formatted)
      }

      return formatted
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return []
      }

      if (typeof err?.status === "number") {
        err = new Error(`Git API Error: ${err.status}`)
      }

      const message = err instanceof Error ? err.message : "Unknown error"

      if (requestVersion === requestVersionRef.current) {
        setError(message)
        setFiles([])
      }

      return []
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    requestVersionRef.current++
    setFiles([])
    setError(null)
    setLoading(false)
  }, [])

  return {
    files,
    loading,
    error,
    fetchChanges,
    reset,
  }
}
