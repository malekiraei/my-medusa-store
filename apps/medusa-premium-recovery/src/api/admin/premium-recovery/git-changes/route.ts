import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import {
  SNAPSHOT_FILE_POLICY_VERSION,
  evaluateSnapshotPath,
} from "../_services/file-eligibility-policy"
import { resolveGitRoot, runGit } from "../_services/git-resolver"

const normalizePathForSnapshot = (path: string) => path.replace(/\\/g, "/").trim()

const parsePorcelainLine = (line: string) => {
  const status = line.slice(0, 2)
  const rawPath = line.slice(3).trim()
  const path = rawPath.includes(" -> ")
    ? rawPath.split(" -> ").pop() ?? rawPath
    : rawPath
  const isDeleted = status.includes("D")

  return {
    path: normalizePathForSnapshot(path),
    status,
    business_impact: isDeleted ? "critical" : "normal",
  }
}

const getGitChanges = async () => {
  try {
    const gitRoot = await resolveGitRoot()

    if (!gitRoot) {
      return {
        git: {
          available: false,
          branch: "unknown",
          clean: false,
        },
        changes: [],
      }
    }

    const [branch, porcelain] = await Promise.all([
      runGit(["branch", "--show-current"], gitRoot).catch(() => "unknown"),
      runGit(["status", "--porcelain"], gitRoot),
    ])

    const rawChanges = porcelain
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map(parsePorcelainLine)
      .filter((change) => change.path.length > 0)
    const evaluatedChanges = await Promise.all(
      rawChanges.map(async (change) => {
        const eligibility = await evaluateSnapshotPath({
          workspaceRoot: gitRoot,
          selectedPath: change.path,
          gitStatus: change.status,
          mode: "git-changes",
        })

        return {
          ...change,
          eligibility,
        }
      })
    )
    const changes = evaluatedChanges
      .filter((change) => change.eligibility.eligible)
      .map((change) => ({
        path: change.eligibility.normalized_relative_path ?? change.path,
        status: change.status,
        business_impact: change.business_impact,
        policy_version: change.eligibility.policy_version,
        scope: change.eligibility.scope,
        file_kind: change.eligibility.file_kind,
        reason: change.eligibility.reason,
        warnings: change.eligibility.warnings,
      }))

    return {
      git: {
        available: true,
        branch: branch || "unknown",
        clean: rawChanges.length === 0,
      },
      ignored_changes_count: rawChanges.length - changes.length,
      policy_version: SNAPSHOT_FILE_POLICY_VERSION,
      changes,
    }
  } catch {
    return {
      git: {
        available: false,
        branch: "unknown",
        clean: false,
      },
      changes: [],
    }
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.json(await getGitChanges())
}
