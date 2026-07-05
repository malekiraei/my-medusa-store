import { createHash } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { basename, join } from "node:path"

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
}

export type RestorePointManifest = {
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
}: {
  id: string
  name: string
  description: string
  businessContext: string
  useCase: string
  createdAt: string
  files: SnapshotFileManifest[]
}): RestorePointManifest => {
  const manifestWithoutHash = {
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
