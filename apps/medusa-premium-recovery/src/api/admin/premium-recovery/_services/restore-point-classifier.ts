import { readFile, stat } from "node:fs/promises"
import { isAbsolute, relative, resolve } from "node:path"

import {
  SNAPSHOT_FILE_POLICY_VERSION,
  evaluateSnapshotPath,
} from "./file-eligibility-policy"
import { sha256, type RestorePointSummary } from "./snapshot-manifest"

export type RestoreReadinessStatus =
  | "Restorable"
  | "Restorable with warnings"
  | "Not restorable"

export type RestoreReadiness = {
  status: RestoreReadinessStatus
  policy_version: string
  legacy_policy: boolean
  restorable_files_count: number
  warning_files_count: number
  not_restorable_files_count: number
  reasons: string[]
  warnings: string[]
}

const unique = (values: string[]) => [...new Set(values)]

const isInside = (parent: string, child: string) => {
  const rel = relative(parent, child)

  return Boolean(rel) && !rel.startsWith("..") && !isAbsolute(rel)
}

export const classifyRestorePoint = async ({
  point,
  workspaceRoot,
  restorePointDirectory,
}: {
  point: RestorePointSummary
  workspaceRoot: string | null
  restorePointDirectory: string
}): Promise<RestoreReadiness> => {
  const reasons: string[] = []
  const warnings: string[] = []
  let restorableFiles = 0
  let warningFiles = 0
  let notRestorableFiles = 0
  const legacyPolicy = !point.policy_version

  if (!workspaceRoot) {
    return {
      status: "Not restorable",
      policy_version: SNAPSHOT_FILE_POLICY_VERSION,
      legacy_policy: legacyPolicy,
      restorable_files_count: 0,
      warning_files_count: 0,
      not_restorable_files_count: point.manifest_files.length,
      reasons: ["workspace_unavailable"],
      warnings: [],
    }
  }

  if (legacyPolicy) {
    warnings.push("legacy_policy_metadata_missing")
  }

  for (const file of point.manifest_files) {
    const fileReasons: string[] = []
    const fileWarnings: string[] = []

    if (file.status !== "captured") {
      fileReasons.push("file_not_captured")
    }

    const decision = await evaluateSnapshotPath({
      workspaceRoot,
      selectedPath: file.path,
      mode: "readiness",
    })

    if (!decision.eligible) {
      fileReasons.push(`policy_${decision.reason_code}`)
    } else if (legacyPolicy) {
      fileWarnings.push("legacy_policy_metadata_missing")
    }

    if (!file.snapshot_path || !file.sha256) {
      fileReasons.push("missing_blob_metadata")
    } else {
      const blobPath = resolve(restorePointDirectory, file.snapshot_path)

      try {
        if (!isInside(restorePointDirectory, blobPath)) {
          fileReasons.push("blob_path_escapes_restore_point")
          throw new Error("Unsafe snapshot blob path")
        }

        const blobStat = await stat(blobPath)

        if (!blobStat.isFile()) {
          fileReasons.push("blob_not_regular_file")
        } else if (blobStat.size !== file.size) {
          fileReasons.push("blob_size_mismatch")
        }

        const blobHash = sha256(await readFile(blobPath))

        if (blobHash !== file.sha256) {
          fileReasons.push("blob_hash_mismatch")
        }
      } catch {
        fileReasons.push("blob_missing")
      }
    }

    if (fileReasons.length > 0) {
      notRestorableFiles += 1
      reasons.push(...fileReasons.map((reason) => `${file.path}:${reason}`))
    } else if (fileWarnings.length > 0) {
      warningFiles += 1
      restorableFiles += 1
      warnings.push(...fileWarnings.map((warning) => `${file.path}:${warning}`))
    } else {
      restorableFiles += 1
    }
  }

  const status: RestoreReadinessStatus = notRestorableFiles > 0
    ? "Not restorable"
    : warnings.length > 0
      ? "Restorable with warnings"
      : "Restorable"

  return {
    status,
    policy_version: point.policy_version ?? SNAPSHOT_FILE_POLICY_VERSION,
    legacy_policy: legacyPolicy,
    restorable_files_count: restorableFiles,
    warning_files_count: warningFiles,
    not_restorable_files_count: notRestorableFiles,
    reasons: unique(reasons),
    warnings: unique(warnings),
  }
}

export const attachRestoreReadiness = async ({
  point,
  workspaceRoot,
  restorePointDirectory,
}: {
  point: RestorePointSummary
  workspaceRoot: string | null
  restorePointDirectory: string
}) => {
  return {
    ...point,
    restore_readiness: await classifyRestorePoint({
      point,
      workspaceRoot,
      restorePointDirectory,
    }),
  }
}
