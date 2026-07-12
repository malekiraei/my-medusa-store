import { createHash } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { basename, join } from "node:path"

import {
  SNAPSHOT_FILE_POLICY_VERSION,
  type FileSizeCheck,
  type SnapshotFileKind,
  type SnapshotFileScope,
} from "./file-eligibility-policy"
import {
  getRelativeStoragePath,
  getRestorePointDirectory,
  getRestorePointManifestPath,
} from "./snapshot-storage"

export type SnapshotFileManifest = {
  path: string
  status: "captured" | "missing"
  snapshot_path: string | null
  size: number
  sha256: string | null
  missing_reason: string | null
  policy_version?: string
  workspace_scope?: SnapshotFileScope
  eligibility_scopes?: SnapshotFileScope[]
  validated_at?: string
  validation_result?: "eligible" | "capture_failed"
  file_kind?: SnapshotFileKind
  original_relative_path?: string
  eligibility?: {
    eligible: boolean
    scope: SnapshotFileScope
    reason_code: string
    policy_version: string
    size_check: FileSizeCheck | null
  }
}

export type RestorePointManifest = {
  manifest_schema_version?: number
  id: string
  hash: string
  name: string
  description: string
  business_context: string
  use_case: string
  created_at: string
  files: SnapshotFileManifest[]
  files_count: number
  captured_files_count: number
  missing_files_count: number
  policy_version?: string
  workspace_scope?: "monorepo"
  eligibility_scopes?: SnapshotFileScope[]
  validated_at?: string
  validation_result?: "passed" | "partial_after_validation" | "legacy"
  eligibility_summary?: {
    policy_version: string
    approved_files_count: number
    rejected_files_count: number
    warning_count: number
    scopes: SnapshotFileScope[]
    total_size: number
  }
}

export type RestorePointSummary = Omit<RestorePointManifest, "files"> & {
  files: string[]
  manifest_files: SnapshotFileManifest[]
  storage_path: string
}

export const sha256 = (value: string | Buffer) => {
  return createHash("sha256").update(value).digest("hex")
}

export const createManifest = ({
  id,
  name,
  description,
  businessContext,
  useCase,
  createdAt,
  files,
  policyVersion = SNAPSHOT_FILE_POLICY_VERSION,
  eligibilitySummary,
}: {
  id: string
  name: string
  description: string
  businessContext: string
  useCase: string
  createdAt: string
  files: SnapshotFileManifest[]
  policyVersion?: string
  eligibilitySummary?: RestorePointManifest["eligibility_summary"]
}): RestorePointManifest => {
  const scopes = [...new Set(
    files
      .map((file) => file.workspace_scope)
      .filter((scope): scope is SnapshotFileScope => Boolean(scope))
  )]
  const validationResult: RestorePointManifest["validation_result"] = files.some((file) => file.status === "missing")
    ? "partial_after_validation"
    : "passed"
  const manifestWithoutHash = {
    manifest_schema_version: 2,
    id,
    name,
    description,
    business_context: businessContext,
    use_case: useCase,
    created_at: createdAt,
    files,
    files_count: files.length,
    captured_files_count: files.filter((file) => file.status === "captured")
      .length,
    missing_files_count: files.filter((file) => file.status === "missing")
      .length,
    policy_version: policyVersion,
    workspace_scope: "monorepo" as const,
    eligibility_scopes: scopes,
    validated_at: createdAt,
    validation_result: validationResult,
    eligibility_summary: eligibilitySummary ?? {
      policy_version: policyVersion,
      approved_files_count: files.length,
      rejected_files_count: 0,
      warning_count: 0,
      scopes,
      total_size: files.reduce((sum, file) => sum + file.size, 0),
    },
  }

  return {
    ...manifestWithoutHash,
    hash: sha256(JSON.stringify(manifestWithoutHash)),
  }
}

export const summarizeManifest = (
  manifest: RestorePointManifest,
  storagePath: string
): RestorePointSummary => {
  return {
    id: manifest.id,
    hash: manifest.hash,
    name: manifest.name,
    description: manifest.description,
    business_context: manifest.business_context,
    use_case: manifest.use_case,
    created_at: manifest.created_at,
    files: manifest.files.map((file) => file.path),
    manifest_files: manifest.files,
    files_count: manifest.files_count,
    captured_files_count: manifest.captured_files_count,
    missing_files_count: manifest.missing_files_count,
    manifest_schema_version: manifest.manifest_schema_version,
    policy_version: manifest.policy_version,
    workspace_scope: manifest.workspace_scope,
    eligibility_scopes: manifest.eligibility_scopes,
    validated_at: manifest.validated_at,
    validation_result: manifest.validation_result,
    eligibility_summary: manifest.eligibility_summary,
    storage_path: storagePath,
  }
}

export const writeManifest = async (manifest: RestorePointManifest) => {
  await writeFile(
    getRestorePointManifestPath(manifest.id),
    JSON.stringify(manifest, null, 2),
    "utf8"
  )
}

export const readManifest = async (restorePointDirectory: string) => {
  const manifestPath = join(restorePointDirectory, "manifest.json")
  const manifest = JSON.parse(
    await readFile(manifestPath, "utf8")
  ) as RestorePointManifest

  return summarizeManifest(manifest, getRelativeStoragePath(restorePointDirectory))
}

export const readManifestById = async (id: string) => {
  return readManifest(getRestorePointDirectory(id))
}

export const getRestorePointIdFromDirectory = (restorePointDirectory: string) => {
  return basename(restorePointDirectory)
}
