import { copyFile, readFile, stat } from "node:fs/promises"
import { extname, join } from "node:path"

import type { ApprovedSnapshotFile } from "./file-eligibility-policy"
import type { SnapshotFileManifest } from "./snapshot-manifest"
import { sha256 } from "./snapshot-manifest"

const missingFileRecord = (
  file: ApprovedSnapshotFile,
  reason = "File did not exist at snapshot time"
): SnapshotFileManifest => {
  return {
    path: file.relativePath,
    status: "missing",
    snapshot_path: null,
    size: 0,
    sha256: null,
    missing_reason: reason,
    policy_version: file.eligibility.policy_version,
    workspace_scope: file.scope,
    eligibility_scopes: [file.scope],
    validated_at: new Date().toISOString(),
    validation_result: "eligible",
    file_kind: file.fileKind,
    original_relative_path: file.relativePath,
    eligibility: {
      eligible: true,
      scope: file.scope,
      reason_code: file.eligibility.reason_code,
      policy_version: file.eligibility.policy_version,
      size_check: file.eligibility.size_check,
    },
  }
}

const getSnapshotFileName = (relativePath: string) => {
  const extension = extname(relativePath)

  return `${sha256(relativePath)}${extension}`
}

export const captureSnapshotFiles = async (
  files: ApprovedSnapshotFile[],
  filesDirectory: string
) => {
  const capturedFiles: SnapshotFileManifest[] = []

  for (const file of files) {
    const snapshotFileName = getSnapshotFileName(file.relativePath)
    const snapshotRelativePath = `files/${snapshotFileName}`
    const snapshotAbsolutePath = join(filesDirectory, snapshotFileName)

    try {
      const fileStat = await stat(file.absolutePath)

      if (!fileStat.isFile()) {
        capturedFiles.push(missingFileRecord(file, "Approved path was no longer a regular file at capture time"))
        continue
      }

      await copyFile(file.absolutePath, snapshotAbsolutePath)

      const copiedContent = await readFile(snapshotAbsolutePath)

      capturedFiles.push({
        path: file.relativePath,
        status: "captured",
        snapshot_path: snapshotRelativePath,
        size: copiedContent.byteLength,
        sha256: sha256(copiedContent),
        missing_reason: null,
        policy_version: file.eligibility.policy_version,
        workspace_scope: file.scope,
        eligibility_scopes: [file.scope],
        validated_at: new Date().toISOString(),
        validation_result: "eligible",
        file_kind: file.fileKind,
        original_relative_path: file.relativePath,
        eligibility: {
          eligible: true,
          scope: file.scope,
          reason_code: file.eligibility.reason_code,
          policy_version: file.eligibility.policy_version,
          size_check: file.eligibility.size_check,
        },
      })
    } catch {
      capturedFiles.push(missingFileRecord(file, "File capture failed after eligibility validation"))
    }
  }

  return capturedFiles
}
