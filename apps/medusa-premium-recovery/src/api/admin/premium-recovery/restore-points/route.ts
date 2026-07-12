import { randomUUID } from "node:crypto"

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import {
  evaluateSnapshotPaths,
  toPublicEligibilityError,
} from "../_services/file-eligibility-policy"
import { resolveGitRoot } from "../_services/git-resolver"
import { attachRestoreReadiness } from "../_services/restore-point-classifier"
import { captureSnapshotFiles } from "../_services/snapshot-capture"
import {
  createManifest,
  readManifest,
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

type RestorePointWithReadiness = Awaited<ReturnType<typeof attachRestoreReadiness>>

const getRestorePoints = async () => {
  const workspaceRoot = await resolveGitRoot()
  const restorePoints = await Promise.all(
    (await listRestorePointDirectories()).map(async (directory) => {
      try {
        return await attachRestoreReadiness({
          point: await readManifest(directory),
          workspaceRoot,
          restorePointDirectory: directory,
        })
      } catch {
        return null
      }
    })
  )

  return restorePoints
    .filter((point): point is RestorePointWithReadiness => Boolean(point))
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

  const eligibility = await evaluateSnapshotPaths({
    workspaceRoot,
    selectedPaths: files as string[],
    mode: "snapshot-create",
  })

  if (!eligibility.valid) {
    return {
      error: "Some selected files are not eligible for snapshot capture",
      statusCode: 400,
      rejected_files: eligibility.rejected.map(toPublicEligibilityError),
      policy_version: eligibility.policy_version,
    }
  }

  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const filesDirectory = await ensureRestorePointFilesDirectory(id)
  const capturedFiles = await captureSnapshotFiles(eligibility.approved, filesDirectory)
  const manifest = createManifest({
    id,
    name,
    description,
    businessContext,
    useCase,
    createdAt,
    files: capturedFiles,
    policyVersion: eligibility.policy_version,
    eligibilitySummary: {
      policy_version: eligibility.policy_version,
      approved_files_count: eligibility.approved.length,
      rejected_files_count: 0,
      warning_count: eligibility.approved.reduce(
        (sum, file) => sum + file.eligibility.warnings.length,
        0
      ),
      scopes: [...new Set(eligibility.approved.map((file) => file.scope))],
      total_size: eligibility.total_size,
    },
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
        rejected_files: result.rejected_files,
        policy_version: result.policy_version,
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
