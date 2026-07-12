import { existsSync } from "node:fs"
import { lstat, realpath } from "node:fs/promises"
import {
  basename,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  win32,
} from "node:path"

export const SNAPSHOT_FILE_POLICY_VERSION = "snapshot-file-policy/monorepo-v1"

export const SNAPSHOT_MAX_FILES = 200
export const SNAPSHOT_MAX_TEXT_FILE_BYTES = 1024 * 1024
export const SNAPSHOT_MAX_ASSET_FILE_BYTES = 5 * 1024 * 1024
export const SNAPSHOT_MAX_TOTAL_BYTES = 10 * 1024 * 1024

export type SnapshotFileScope =
  | "backend-source"
  | "backend-config"
  | "storefront-source"
  | "storefront-public-asset"
  | "storefront-config"
  | "plugin-source"
  | "plugin-config"
  | "workspace-config"

export type SnapshotFileKind =
  | "source"
  | "config"
  | "documentation"
  | "query"
  | "asset"

export type EligibilityReasonCode =
  | "eligible"
  | "empty_path"
  | "invalid_path"
  | "absolute_path"
  | "path_traversal"
  | "outside_workspace"
  | "outside_allowed_scope"
  | "missing_file"
  | "not_regular_file"
  | "symlink"
  | "deleted_file"
  | "duplicate_path"
  | "denied_path"
  | "secret_file"
  | "archive_file"
  | "database_file"
  | "runtime_file"
  | "unsupported_extension"
  | "file_too_large"
  | "too_many_files"
  | "snapshot_too_large"

export type FileSizeCheck = {
  size: number
  limit: number
  passed: boolean
}

export type EligibilityDecision = {
  eligible: boolean
  scope: SnapshotFileScope | null
  normalized_relative_path: string | null
  absolute_path: string | null
  real_path: string | null
  reason_code: EligibilityReasonCode
  reason: string
  policy_version: string
  file_kind: SnapshotFileKind | null
  size_check: FileSizeCheck | null
  warnings: string[]
}

export type ApprovedSnapshotFile = {
  relativePath: string
  absolutePath: string
  realPath: string
  scope: SnapshotFileScope
  fileKind: SnapshotFileKind
  size: number
  eligibility: EligibilityDecision
}

export type EligibilityBatchResult = {
  policy_version: string
  valid: boolean
  approved: ApprovedSnapshotFile[]
  rejected: EligibilityDecision[]
  total_size: number
}

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".scss",
  ".less",
  ".html",
  ".md",
  ".yml",
  ".yaml",
  ".graphql",
  ".gql",
  ".sql",
])

const STOREFRONT_ASSET_EXTENSIONS = new Set([
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
])

const DENIED_PATH_PARTS = new Set([
  ".git",
  ".cache",
  ".medusa",
  ".next",
  ".premium-recovery",
  ".runtime",
  ".turbo",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "logs",
  "cache",
  "tmp",
  "temp",
  "temp-extract",
  "restore-points",
  "snapshots",
  "backup",
  "backups",
])

const ARCHIVE_EXTENSIONS = new Set([
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".tgz",
  ".bz2",
  ".xz",
])

const DATABASE_EXTENSIONS = new Set([
  ".sqlite",
  ".sqlite3",
  ".db",
  ".db3",
  ".dump",
  ".bak",
  ".backup",
  ".mdb",
  ".accdb",
  ".parquet",
])

const LOG_RUNTIME_EXTENSIONS = new Set([
  ".log",
  ".pid",
  ".runtime",
])

const ROOT_CONFIG_FILES = new Set([
  "package.json",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "pnpm-workspace.yaml",
  "turbo.json",
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  "prettier.config.js",
  "prettier.config.mjs",
  "prettier.config.cjs",
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yml",
  ".prettierrc.yaml",
])

const APP_CONFIG_FILE_NAMES = new Set([
  "package.json",
  "medusa-config.ts",
  "medusa-config.js",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.ts",
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  "tailwind.config.js",
  "tailwind.config.ts",
  "postcss.config.js",
  "postcss.config.cjs",
])

const safePath = (value: string | null) => value?.replace(/\\/g, "/") ?? null

const deny = (
  reason_code: EligibilityReasonCode,
  reason: string,
  partial: Partial<EligibilityDecision> = {}
): EligibilityDecision => ({
  eligible: false,
  scope: null,
  normalized_relative_path: null,
  absolute_path: null,
  real_path: null,
  reason_code,
  reason,
  policy_version: SNAPSHOT_FILE_POLICY_VERSION,
  file_kind: null,
  size_check: null,
  warnings: [],
  ...partial,
})

const decodePath = (selectedPath: string) => {
  try {
    return decodeURIComponent(selectedPath)
  } catch {
    return selectedPath
  }
}

const hasControlCharacters = (value: string) => /[\u0000-\u001f]/.test(value)

const normalizeRelativePath = (selectedPath: string) => {
  const decoded = decodePath(selectedPath)
  const normalized = decoded.replace(/\\/g, "/").trim()

  if (!normalized) {
    return deny("empty_path", "Every file path must be a non-empty string")
  }

  if (hasControlCharacters(normalized)) {
    return deny("invalid_path", "File path contains invalid control characters", {
      normalized_relative_path: safePath(normalized),
    })
  }

  if (isAbsolute(normalized) || win32.isAbsolute(normalized)) {
    return deny("absolute_path", "Absolute paths are not accepted", {
      normalized_relative_path: safePath(normalized),
    })
  }

  const parts = normalized.split("/").filter(Boolean)

  if (parts.length === 0 || parts.some((part) => part === "." || part === "..")) {
    return deny("path_traversal", "Path traversal segments are not accepted", {
      normalized_relative_path: safePath(normalized),
    })
  }

  return normalized
}

const isInside = (parent: string, child: string) => {
  const rel = relative(parent, child)

  return Boolean(rel) && !rel.startsWith("..") && !isAbsolute(rel)
}

const hasDeniedPart = (relativePath: string) => {
  const parts = relativePath.toLowerCase().split("/").filter(Boolean)

  return parts.find((part) => DENIED_PATH_PARTS.has(part)) ?? null
}

const isSensitiveName = (fileName: string) => {
  const lower = fileName.toLowerCase()

  return lower === ".env" ||
    lower.startsWith(".env.") ||
    lower.endsWith(".env") ||
    lower.includes("secret") ||
    lower.includes("credential") ||
    lower.includes("token") ||
    lower === "id_rsa" ||
    lower === "id_dsa" ||
    lower === "id_ecdsa" ||
    lower === "id_ed25519" ||
    lower.endsWith(".pem") ||
    lower.endsWith(".key") ||
    lower.endsWith(".crt") ||
    lower.endsWith(".p12") ||
    lower.endsWith(".pfx")
}

const isRootTypescriptConfig = (relativePath: string) => {
  return /^tsconfig(?:\.[^.\/]+)?\.json$/i.test(relativePath)
}

const isAppTypescriptConfig = (fileName: string) => {
  return /^tsconfig(?:\.[^.\/]+)?\.json$/i.test(fileName)
}

const isExplicitAppConfig = (fileName: string) => {
  return APP_CONFIG_FILE_NAMES.has(fileName) || isAppTypescriptConfig(fileName)
}

const getKnownAppName = (relativePath: string) => {
  const parts = relativePath.split("/")

  return parts[0] === "apps" && parts.length >= 2 ? parts[1] : null
}

const appExists = (workspaceRoot: string, appName: string) => {
  return existsSync(join(workspaceRoot, "apps", appName, "package.json"))
}

const classifyTextKind = (extension: string): SnapshotFileKind => {
  if (extension === ".md") return "documentation"
  if (extension === ".sql" || extension === ".graphql" || extension === ".gql") {
    return "query"
  }

  return "source"
}

const classifyAllowedScope = (
  workspaceRoot: string,
  relativePath: string
): { scope: SnapshotFileScope; fileKind: SnapshotFileKind; sizeLimit: number } | null => {
  const normalized = relativePath.replace(/\\/g, "/")
  const fileName = basename(normalized)
  const extension = extname(fileName).toLowerCase()
  const appName = getKnownAppName(normalized)

  if (ROOT_CONFIG_FILES.has(normalized) || isRootTypescriptConfig(normalized)) {
    return {
      scope: "workspace-config",
      fileKind: "config",
      sizeLimit: SNAPSHOT_MAX_TEXT_FILE_BYTES,
    }
  }

  if (!appName || !appExists(workspaceRoot, appName)) {
    return null
  }

  const appRoot = `apps/${appName}/`
  const appRelative = normalized.slice(appRoot.length)

  if (appName === "backend") {
    if (appRelative.startsWith("src/") && TEXT_EXTENSIONS.has(extension)) {
      return {
        scope: "backend-source",
        fileKind: classifyTextKind(extension),
        sizeLimit: SNAPSHOT_MAX_TEXT_FILE_BYTES,
      }
    }

    if (!appRelative.includes("/") && isExplicitAppConfig(fileName)) {
      return {
        scope: "backend-config",
        fileKind: "config",
        sizeLimit: SNAPSHOT_MAX_TEXT_FILE_BYTES,
      }
    }

    return null
  }

  if (appName === "storefront") {
    const sourceRoots = ["src/", "app/", "pages/", "components/"]

    if (sourceRoots.some((root) => appRelative.startsWith(root)) && TEXT_EXTENSIONS.has(extension)) {
      return {
        scope: "storefront-source",
        fileKind: classifyTextKind(extension),
        sizeLimit: SNAPSHOT_MAX_TEXT_FILE_BYTES,
      }
    }

    if (appRelative.startsWith("public/") && STOREFRONT_ASSET_EXTENSIONS.has(extension)) {
      return {
        scope: "storefront-public-asset",
        fileKind: extension === ".svg" ? "source" : "asset",
        sizeLimit: extension === ".svg"
          ? SNAPSHOT_MAX_TEXT_FILE_BYTES
          : SNAPSHOT_MAX_ASSET_FILE_BYTES,
      }
    }

    if (!appRelative.includes("/") && isExplicitAppConfig(fileName)) {
      return {
        scope: "storefront-config",
        fileKind: "config",
        sizeLimit: SNAPSHOT_MAX_TEXT_FILE_BYTES,
      }
    }

    return null
  }

  if (appRelative.startsWith("src/") && TEXT_EXTENSIONS.has(extension)) {
    return {
      scope: "plugin-source",
      fileKind: classifyTextKind(extension),
      sizeLimit: SNAPSHOT_MAX_TEXT_FILE_BYTES,
    }
  }

  if (!appRelative.includes("/") && isExplicitAppConfig(fileName)) {
    return {
      scope: "plugin-config",
      fileKind: "config",
      sizeLimit: SNAPSHOT_MAX_TEXT_FILE_BYTES,
    }
  }

  return null
}

export const evaluateSnapshotPath = async ({
  workspaceRoot,
  selectedPath,
  gitStatus,
  mode = "snapshot-create",
}: {
  workspaceRoot: string
  selectedPath: string
  gitStatus?: string
  mode?: "git-changes" | "snapshot-create" | "readiness" | "restore"
}): Promise<EligibilityDecision> => {
  if (gitStatus?.includes("D")) {
    return deny("deleted_file", "Deleted files cannot be captured", {
      normalized_relative_path: safePath(selectedPath),
    })
  }

  const normalized = normalizeRelativePath(selectedPath)

  if (typeof normalized !== "string") {
    return normalized
  }

  const absolutePath = resolve(workspaceRoot, normalized)

  if (!isInside(workspaceRoot, absolutePath)) {
    return deny("outside_workspace", "File path escapes the workspace", {
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
    })
  }

  const deniedPart = hasDeniedPart(normalized)

  if (deniedPart) {
    return deny("denied_path", `Path part is always denied: ${deniedPart}`, {
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
    })
  }

  if (normalized.toLowerCase().startsWith("zcode/reports/") ||
    normalized.toLowerCase().startsWith("zcode/sessions/") ||
    normalized.toLowerCase().startsWith("dev-kernel/logs/") ||
    normalized.toLowerCase().startsWith("dev-kernel/.runtime/")) {
    return deny("runtime_file", "Reports, sessions, logs, and runtime data are not snapshot-eligible", {
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
    })
  }

  const fileName = basename(normalized)
  const extension = extname(fileName).toLowerCase()

  if (isSensitiveName(fileName)) {
    return deny("secret_file", "Secret, environment, credential, token, and key files are not allowed", {
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
    })
  }

  if (ARCHIVE_EXTENSIONS.has(extension)) {
    return deny("archive_file", "Archive files are not snapshot-eligible", {
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
    })
  }

  if (DATABASE_EXTENSIONS.has(extension)) {
    return deny("database_file", "Database and dump files require a separate backup policy", {
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
    })
  }

  if (LOG_RUNTIME_EXTENSIONS.has(extension)) {
    return deny("runtime_file", "Log and runtime files are not snapshot-eligible", {
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
    })
  }

  const allowed = classifyAllowedScope(workspaceRoot, normalized)

  if (!allowed) {
    return deny("outside_allowed_scope", "File is outside the supported development scopes", {
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
    })
  }

  if (!TEXT_EXTENSIONS.has(extension) &&
    !(allowed.scope === "storefront-public-asset" && STOREFRONT_ASSET_EXTENSIONS.has(extension))) {
    return deny("unsupported_extension", "File extension is not allowed for its scope", {
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
    })
  }

  let fileStat

  try {
    fileStat = await lstat(absolutePath)
  } catch {
    if (mode === "readiness" || mode === "restore") {
      return {
        eligible: true,
        scope: allowed.scope,
        normalized_relative_path: normalized,
        absolute_path: safePath(absolutePath),
        real_path: safePath(absolutePath),
        reason_code: "eligible",
        reason: "Path is policy-eligible; current workspace file is missing",
        policy_version: SNAPSHOT_FILE_POLICY_VERSION,
        file_kind: allowed.fileKind,
        size_check: null,
        warnings: ["current_workspace_file_missing"],
      }
    }

    return deny("missing_file", "File does not exist", {
      scope: allowed.scope,
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
      file_kind: allowed.fileKind,
    })
  }

  if (fileStat.isSymbolicLink()) {
    return deny("symlink", "Symlinks and junction-like paths are not snapshot-eligible", {
      scope: allowed.scope,
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
      file_kind: allowed.fileKind,
    })
  }

  if (!fileStat.isFile()) {
    return deny("not_regular_file", "Only regular files can be captured", {
      scope: allowed.scope,
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
      file_kind: allowed.fileKind,
    })
  }

  const realPath = await realpath(absolutePath)

  if (!isInside(workspaceRoot, realPath)) {
    return deny("outside_workspace", "Resolved file path escapes the workspace", {
      scope: allowed.scope,
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
      real_path: safePath(realPath),
      file_kind: allowed.fileKind,
    })
  }

  if (fileStat.size > allowed.sizeLimit) {
    return deny("file_too_large", "File exceeds the configured snapshot size limit", {
      scope: allowed.scope,
      normalized_relative_path: normalized,
      absolute_path: safePath(absolutePath),
      real_path: safePath(realPath),
      file_kind: allowed.fileKind,
      size_check: {
        size: fileStat.size,
        limit: allowed.sizeLimit,
        passed: false,
      },
    })
  }

  return {
    eligible: true,
    scope: allowed.scope,
    normalized_relative_path: normalized,
    absolute_path: safePath(absolutePath),
    real_path: safePath(realPath),
    reason_code: "eligible",
    reason: "File passed snapshot eligibility policy",
    policy_version: SNAPSHOT_FILE_POLICY_VERSION,
    file_kind: allowed.fileKind,
    size_check: {
      size: fileStat.size,
      limit: allowed.sizeLimit,
      passed: true,
    },
    warnings: [],
  }
}

export const evaluateSnapshotPaths = async ({
  workspaceRoot,
  selectedPaths,
  mode = "snapshot-create",
}: {
  workspaceRoot: string
  selectedPaths: string[]
  mode?: "snapshot-create" | "readiness" | "restore"
}): Promise<EligibilityBatchResult> => {
  if (selectedPaths.length > SNAPSHOT_MAX_FILES) {
    return {
      policy_version: SNAPSHOT_FILE_POLICY_VERSION,
      valid: false,
      approved: [],
      rejected: [
        deny("too_many_files", `A snapshot can include at most ${SNAPSHOT_MAX_FILES} files`),
      ],
      total_size: 0,
    }
  }

  const approved: ApprovedSnapshotFile[] = []
  const rejected: EligibilityDecision[] = []
  const seen = new Set<string>()

  for (const selectedPath of selectedPaths) {
    const decision = await evaluateSnapshotPath({
      workspaceRoot,
      selectedPath,
      mode,
    })

    if (!decision.eligible) {
      rejected.push(decision)
      continue
    }

    const normalized = decision.normalized_relative_path!

    if (seen.has(normalized.toLowerCase())) {
      rejected.push(deny("duplicate_path", "Duplicate selected file path", {
        normalized_relative_path: normalized,
        absolute_path: decision.absolute_path,
        real_path: decision.real_path,
        scope: decision.scope,
        file_kind: decision.file_kind,
        size_check: decision.size_check,
      }))
      continue
    }

    seen.add(normalized.toLowerCase())
    approved.push({
      relativePath: normalized,
      absolutePath: decision.absolute_path!,
      realPath: decision.real_path!,
      scope: decision.scope!,
      fileKind: decision.file_kind!,
      size: decision.size_check?.size ?? 0,
      eligibility: decision,
    })
  }

  const totalSize = approved.reduce((sum, file) => sum + file.size, 0)

  if (totalSize > SNAPSHOT_MAX_TOTAL_BYTES) {
    rejected.push(deny("snapshot_too_large", `A snapshot can include at most ${SNAPSHOT_MAX_TOTAL_BYTES} bytes`))
  }

  return {
    policy_version: SNAPSHOT_FILE_POLICY_VERSION,
    valid: rejected.length === 0,
    approved: rejected.length === 0 ? approved : [],
    rejected,
    total_size: totalSize,
  }
}

export const toPublicEligibilityError = (decision: EligibilityDecision) => ({
  path: decision.normalized_relative_path ?? "unusable path",
  reason_code: decision.reason_code,
  reason: decision.reason,
  scope: decision.scope,
  policy_version: decision.policy_version,
})
