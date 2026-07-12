import { useCallback, useRef, useState } from "react"

import { sdk } from "../../../lib/client"

export type ChangedFile = {
  path: string
  status: "added" | "deleted" | "modified" | "untracked"
  business_impact?: string
  scope?: string
  file_kind?: string
  policy_version?: string
  eligibility_reason?: string
  eligibility_warnings?: string[]
}

type ApiChange = {
  path?: string
  status?: string
  type?: "added" | "deleted" | "modified"
  business_impact?: string
  scope?: string
  file_kind?: string
  policy_version?: string
  reason?: string
  warnings?: string[]
}

const getChangeType = (
  status: string
): "added" | "deleted" | "modified" | "untracked" => {
  const trimmed = status.trim()

  if (trimmed === "??") return "untracked"
  if (trimmed.includes("D")) return "deleted"
  if (trimmed.includes("A")) return "added"

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
      const changes: ApiChange[] = Array.isArray(data?.changes)
        ? data.changes
        : []
      const formatted: ChangedFile[] = changes
        .map((change) => {
          const status = change.status || ""
          const changeType = getChangeType(status)
          const path = typeof change.path === "string"
            ? change.path.replace(/\\/g, "/").trim()
            : ""

          return {
            path,
            status: changeType,
            business_impact: change.business_impact || "normal",
            scope: change.scope,
            file_kind: change.file_kind,
            policy_version: change.policy_version,
            eligibility_reason: change.reason,
            eligibility_warnings: Array.isArray(change.warnings) ? change.warnings : [],
          }
        })
        .filter((file) => file.path.length > 0)

      if (requestVersion === requestVersionRef.current) {
        setFiles(formatted)
      }

      return formatted
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return []
      }

      const errorValue = typeof err?.status === "number"
        ? new Error(`Git API Error: ${err.status}`)
        : err
      const message = errorValue instanceof Error
        ? errorValue.message
        : "Unknown error"

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
