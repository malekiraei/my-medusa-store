import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { resolveGitRoot, runGit } from "../_services/git-resolver"

const parsePorcelainLine = (line: string) => {
  const status = line.slice(0, 2)
  const rawPath = line.slice(3).trim()
  const path = rawPath.includes(" -> ")
    ? rawPath.split(" -> ").pop() ?? rawPath
    : rawPath
  const isDeleted = status.includes("D")

  return {
    path,
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

    const changes = porcelain
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map(parsePorcelainLine)
      .filter((change) => change.path.length > 0)

    return {
      git: {
        available: true,
        branch: branch || "unknown",
        clean: changes.length === 0,
      },
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
