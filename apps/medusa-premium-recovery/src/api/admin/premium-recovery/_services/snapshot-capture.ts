import { copyFile, readFile, stat } from "node:fs/promises"
import { extname, isAbsolute, join, relative, resolve } from "node:path"

import type { SnapshotFileManifest } from "./snapshot-manifest"
import { sha256 } from "./snapshot-manifest"

type NormalizedSnapshotFile = {
  relativePath: string
  absolutePath: string
}

const missingFileRecord = (relativePath: string): SnapshotFileManifest => {
  return {
    path: relativePath,
    status: "missing",
    snapshot_path: null,
    size: 0,
    sha256: null,
    missing_reason: "File did not exist at snapshot time",
  }
}

const isInsideWorkspace = (workspaceRoot: string, absolutePath: string) => {
  const relativePath = relative(workspaceRoot, absolutePath)

  return Boolean(relativePath) &&
    !relativePath.startsWith("..") &&
    !isAbsolute(relativePath)
}

export const normalizeSelectedPath = (
  workspaceRoot: string,
  selectedPath: string
): NormalizedSnapshotFile => {
  const normalizedPath = selectedPath.replace(/\\/g, "/").trim()

  if (!normalizedPath) {
    throw new Error("Every file path must be a non-empty string")
  }

  const absolutePath = resolve(workspaceRoot, normalizedPath)

  if (!isInsideWorkspace(workspaceRoot, absolutePath)) {
    throw new Error(`File path escapes workspace root: ${selectedPath}`)
  }

  return {
    relativePath: relative(workspaceRoot, absolutePath).replace(/\\/g, "/"),
    absolutePath,
  }
}

export const normalizeSelectedPaths = (
  workspaceRoot: string,
  selectedPaths: string[]
) => {
  return selectedPaths.map((file) => normalizeSelectedPath(workspaceRoot, file))
}

const getSnapshotFileName = (relativePath: string) => {
  const extension = extname(relativePath)

  return `${sha256(relativePath)}${extension}`
}

export const captureSnapshotFiles = async (
  files: NormalizedSnapshotFile[],
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
        capturedFiles.push(missingFileRecord(file.relativePath))
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
      })
    } catch {
      capturedFiles.push(missingFileRecord(file.relativePath))
    }
  }

  return capturedFiles
}
