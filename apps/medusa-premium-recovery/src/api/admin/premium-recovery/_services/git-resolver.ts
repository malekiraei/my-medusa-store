import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

const hasGitMarker = (directory: string) => {
  return existsSync(join(directory, ".git"))
}

const uniqueCandidates = (candidates: string[]) => {
  return [...new Set(candidates.map((candidate) => resolve(candidate)))]
}

export const getParentCandidates = (startDirectory: string) => {
  const candidates: string[] = []
  let current = resolve(startDirectory)

  while (true) {
    candidates.push(current)

    const parent = dirname(current)
    if (parent === current) {
      break
    }

    current = parent
  }

  return candidates
}

const getWorkspaceCandidates = (startDirectory: string) => {
  const roots = getParentCandidates(startDirectory)
  const candidates = roots.flatMap((root) => [
    root,
    join(root, "apps", "backend"),
    join(root, "apps", "medusa-premium-recovery"),
  ])

  return candidates.filter(
    (candidate) => existsSync(candidate) && hasGitMarker(candidate)
  )
}

export const isValidGitRoot = async (directory: string) => {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["rev-parse", "--is-inside-work-tree"],
      {
        cwd: directory,
        windowsHide: true,
      }
    )

    return String(stdout).trim() === "true"
  } catch {
    return false
  }
}

const getGitTopLevel = async (directory: string) => {
  const { stdout } = await execFileAsync(
    "git",
    ["rev-parse", "--show-toplevel"],
    {
      cwd: directory,
      windowsHide: true,
    }
  )

  return resolve(String(stdout).trim())
}

export const resolveGitRoot = async () => {
  const cwd = process.cwd()
  const candidates = uniqueCandidates([
    ...(process.env.PREMIUM_RECOVERY_GIT_ROOT
      ? [process.env.PREMIUM_RECOVERY_GIT_ROOT]
      : []),
    cwd,
    ...getParentCandidates(cwd),
    ...getWorkspaceCandidates(cwd),
  ])

  for (const candidate of candidates) {
    if (await isValidGitRoot(candidate)) {
      return getGitTopLevel(candidate)
    }
  }

  return null
}

export const runGit = async (args: string[], cwd: string) => {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    windowsHide: true,
  })

  return String(stdout).trim()
}
