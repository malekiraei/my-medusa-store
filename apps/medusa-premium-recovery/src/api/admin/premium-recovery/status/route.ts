import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { resolveGitRoot, runGit } from "../_services/git-resolver"

const getGitStatus = async () => {
  try {
    const gitRoot = await resolveGitRoot()

    if (!gitRoot) {
      return {
        available: false,
        branch: "unknown",
        clean: false,
        changedFilesCount: 0,
      }
    }

    const [branch, porcelain] = await Promise.all([
      runGit(["branch", "--show-current"], gitRoot).catch(() => "unknown"),
      runGit(["status", "--porcelain"], gitRoot),
    ])

    const changes = porcelain
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    return {
      available: true,
      branch: branch || "unknown",
      clean: changes.length === 0,
      changedFilesCount: changes.length,
    }
  } catch {
    return {
      available: false,
      branch: "unknown",
      clean: false,
      changedFilesCount: 0,
    }
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const git = await getGitStatus()
  const level = git.available && git.clean ? "unprotected" : "unprotected"
  const message = git.available
    ? git.clean
      ? "Git is available and clean, but no recovery persistence is configured."
      : "Git has uncommitted changes and no recovery persistence is configured."
    : "Git status is unavailable and no recovery persistence is configured."

  res.json({
    protection: {
      level,
      message,
      safety_active: false,
    },
    git: {
      available: git.available,
      clean: git.clean,
      branch: git.branch,
    },
    recovery: {
      latest_snapshot: null,
      bundle_count: 0,
      changed_files_count: git.changedFilesCount,
      last_successful_restore: null,
    },
  })
}
