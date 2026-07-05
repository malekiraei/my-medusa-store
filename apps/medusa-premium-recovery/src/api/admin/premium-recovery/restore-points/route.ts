import { randomUUID } from "node:crypto"

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { resolveGitRoot } from "../_services/git-resolver"
import { captureSnapshotFiles, normalizeSelectedPaths } from "../_services/snapshot-capture"
import {
  createManifest,
  readManifest,
  type RestorePointSummary,
  writeManifest,
} from "../_services/snapshot-manifest"
import {
  ensureRestorePointFilesDirectory,
  getRestorePointDirectory,
  listRestorePointDirectories,
} from "../_services/snapshot-storage"

const jsonResponse = (
  res: MedusaResponse,
  statusCode: number,
  body: Record<string, unknown>
) => {
  res.status(statusCode).json(body)
}

const getRequestBody = async (req: MedusaRequest) => {
  const request = req as MedusaRequest & {
    body?: unknown
    json?: () => Promise<unknown>
  }

  if (request.body && typeof request.body === "object") {
    return request.body as Record<string, unknown>
  }

  if (typeof request.json === "function") {
    const body = await request.json()

    if (body && typeof body === "object") {
      return body as Record<string, unknown>
    }
  }

  return {}
}

const getRestorePoints = async () => {
  const restorePoints = await Promise.all(
    (await listRestorePointDirectories()).map(async (directory) => {
      try {
        return await readManifest(directory)
      } catch {
        return null
      }
    })
  )

  return restorePoints
    .filter((point): point is RestorePointSummary => Boolean(point))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

const createRestorePoint = async (body: Record<string, unknown>) => {
  const name = String(body.name ?? "").trim()
  const description = String(body.description ?? "").trim()
  const businessContext = String(body.business_context ?? "").trim()
  const useCase = String(body.use_case ?? "manual").trim() || "manual"
  const files = body.files

  if (!name) {
    return {
      error: "Snapshot name is required",
      statusCode: 400,
    }
  }

  if (!Array.isArray(files) || files.length === 0) {
    return {
      error: "At least one selected file is required",
      statusCode: 400,
    }
  }

  if (!files.every((file) => typeof file === "string")) {
    return {
      error: "Every selected file path must be a string",
      statusCode: 400,
    }
  }

  const workspaceRoot = await resolveGitRoot()

  if (!workspaceRoot) {
    return {
      error: "Git workspace root could not be resolved",
      statusCode: 503,
    }
  }

  let normalizedFiles: ReturnType<typeof normalizeSelectedPaths>

  try {
    normalizedFiles = normalizeSelectedPaths(workspaceRoot, files as string[])
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Invalid file path",
      statusCode: 400,
    }
  }

  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const filesDirectory = await ensureRestorePointFilesDirectory(id)
  const capturedFiles = await captureSnapshotFiles(normalizedFiles, filesDirectory)
  const manifest = createManifest({
    id,
    name,
    description,
    businessContext,
    useCase,
    createdAt,
    files: capturedFiles,
  })

  await writeManifest(manifest)

  const restorePointDirectory = getRestorePointDirectory(id)
  const restorePoint = await readManifest(restorePointDirectory)

  return {
    restorePoint,
    statusCode: 201,
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.json({
    restore_points: await getRestorePoints(),
  })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const result = await createRestorePoint(await getRequestBody(req))

    if ("error" in result) {
      jsonResponse(res, result.statusCode, {
        message: result.error,
      })
      return
    }

    jsonResponse(res, result.statusCode, {
      restore_point: result.restorePoint,
    })
  } catch (error) {
    jsonResponse(res, 500, {
      message:
        error instanceof Error
          ? error.message
          : "Failed to create restore point",
    })
  }
}
