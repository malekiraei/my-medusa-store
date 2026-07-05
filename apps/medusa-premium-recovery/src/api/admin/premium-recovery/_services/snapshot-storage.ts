import { existsSync } from "node:fs"
import { mkdir, readdir } from "node:fs/promises"
import { join, relative } from "node:path"

export const getRestorePointsRoot = () => {
  return join(process.cwd(), ".premium-recovery", "restore-points")
}

export const getRestorePointDirectory = (id: string) => {
  return join(getRestorePointsRoot(), id)
}

export const getRestorePointFilesDirectory = (id: string) => {
  return join(getRestorePointDirectory(id), "files")
}

export const getRestorePointManifestPath = (id: string) => {
  return join(getRestorePointDirectory(id), "manifest.json")
}

export const ensureRestorePointFilesDirectory = async (id: string) => {
  const filesDirectory = getRestorePointFilesDirectory(id)

  await mkdir(filesDirectory, { recursive: true })

  return filesDirectory
}

export const getRelativeStoragePath = (restorePointDirectory: string) => {
  return relative(process.cwd(), restorePointDirectory).replace(/\\/g, "/")
}

export const listRestorePointDirectories = async () => {
  const root = getRestorePointsRoot()

  if (!existsSync(root)) {
    return []
  }

  const entries = await readdir(root, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name))
}
