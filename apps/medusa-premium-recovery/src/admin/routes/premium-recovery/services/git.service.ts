// src/admin/routes/premium-recovery/services/git.service.ts
// ============================================================
// Git Service - FIXED
// ✅ endpoint صحیح: /admin/premium-recovery/git-changes
// ✅ response mapping صحیح
// ============================================================

import { sdk } from "../../../lib/client"
import type { SnapshotFile, SnapshotFileStatus } from "../types/snapshot-workflow"

export type GitServiceResult = {
  files: SnapshotFile[]
  error?: string
}

const normalizeGitStatus = (value: unknown): SnapshotFileStatus => {
  const status = String(value ?? "").trim()

  if (status === "??") {
    return "untracked"
  }

  if (status.startsWith("R") || status.includes("R")) {
    return "renamed"
  }

  if (status.includes("D")) {
    return "deleted"
  }

  if (status.includes("A")) {
    return "added"
  }

  if (status.includes("M")) {
    return "modified"
  }

  return "modified"
}

// ============================================================
// ✅ fetchGitFiles - با endpoint صحیح
// ============================================================
async function fetchGitFiles(signal?: AbortSignal): Promise<SnapshotFile[]> {
  // ✅ FIX: endpoint صحیح
  const data = await sdk.client.fetch<any>("/admin/premium-recovery/git-changes", {
    signal,
  })

  // ✅ بررسی ساختار response
  console.log("📡 Git API Response:", data)

  // ✅ mapping صحیح برای git-changes
  const rawChanges =
    data?.changes ??
    data?.data?.changes ??
    data?.files ??
    []

  if (!Array.isArray(rawChanges) || rawChanges.length === 0) {
    console.warn("⚠️ No changes found in git response")
    return []
  }

  const files = rawChanges
    .map((c: any) => ({
      path: String(c.path || c.filePath || "").replace(/\\/g, "/").trim(),
      status: normalizeGitStatus(c.status || c.type),
      oldPath: c.oldPath || "",
      business_impact: c.business_impact || "normal",
      scope: c.scope,
      file_kind: c.file_kind,
      policy_version: c.policy_version,
      eligibility_reason: c.reason,
      eligibility_warnings: Array.isArray(c.warnings) ? c.warnings : [],
    }))
    .filter((f: SnapshotFile) => f.path.length > 0)

  console.log(`✅ ${files.length} files normalized from git`)
  return files
}

// ============================================================
// ✅ fetchGitFilesWithRetry - با retry logic
// ============================================================
export async function fetchGitFilesWithRetry(
  maxRetries: number = 2,
  signal?: AbortSignal
): Promise<GitServiceResult> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const files = await fetchGitFiles(signal)
      return { files }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (signal?.aborted) {
        return { files: [], error: "درخواست لغو شد" }
      }
      
      if (attempt === maxRetries) break
      
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }

  return {
    files: [],
    error: lastError?.message || "خطا در دریافت فایل‌ها",
  }
}
