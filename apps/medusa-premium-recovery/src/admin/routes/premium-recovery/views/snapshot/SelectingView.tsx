import { useMemo, useState } from "react"

import { Badge, Button, Checkbox, Input, Text, clsx } from "../../../../../ui/vendor"
import {
  Archive,
  Database,
  FileClock,
  Package,
  Search,
  Shield,
  TriangleAlert,
  X,
} from "../../../../../ui/vendor/lucide"

type FileItem = {
  path: string
  name?: string
  status?: "added" | "modified" | "deleted" | "renamed" | "untracked"
}

type Props = {
  files?: FileItem[] | null
  selectedFiles?: string[] | null
  error?: string | null
  onToggleFile?: (path: string) => void
  onSelectAll?: () => void
  isAllSelected?: boolean
}

const getFileName = (path: string) => {
  const normalized = path.replace(/\\/g, "/")
  return normalized.split("/").pop() || path
}

const truncatePath = (path: string, maxLength = 68): string => {
  if (!path || path.length <= maxLength) {
    return path
  }

  const normalized = path.replace(/\\/g, "/")
  const parts = normalized.split("/")

  if (parts.length <= 2) {
    return `${path.slice(0, maxLength)}...`
  }

  return `.../${parts.slice(-3).join("/")}`
}

const getFileCategory = (path: string): string => {
  const normalized = path.toLowerCase().replace(/\\/g, "/")
  const fileName = normalized.split("/").pop() || normalized

  if (fileName === ".env" || fileName.includes(".env")) return "Environment"
  if (
    fileName === "package.json" ||
    fileName.includes("tsconfig") ||
    fileName.includes("vite") ||
    fileName.includes("eslint") ||
    fileName.includes("tailwind") ||
    fileName.includes("postcss") ||
    fileName.includes("medusa-config")
  ) {
    return "Configuration"
  }
  if (fileName.startsWith("readme") || fileName.endsWith(".md")) return "Documentation"
  if (/\.(png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|mp4|webm)$/i.test(fileName)) {
    return "Asset"
  }
  if (normalized.includes("/admin/") || normalized.includes("/components/") || normalized.includes("/views/")) {
    return "Admin UI"
  }
  if (normalized.includes("/src/") || normalized.includes("/api/") || normalized.includes("/modules/")) {
    return "Source"
  }

  return "Workspace"
}

const getFileIcon = (path: string) => {
  const normalized = path.toLowerCase().replace(/\\/g, "/")
  const fileName = normalized.split("/").pop() || normalized
  const ext = fileName.split(".").pop() || ""

  if (fileName.includes(".env")) return Shield
  if (["json", "yaml", "yml", "lock"].includes(ext)) return Database
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "ico", "zip"].includes(ext)) return Archive
  if (normalized.includes("/components/") || normalized.includes("/views/")) return Package
  return FileClock
}

const getStatusColor = (
  status?: string
): "green" | "orange" | "red" | "blue" | "grey" => {
  switch (status) {
    case "added":
      return "green"
    case "modified":
      return "orange"
    case "deleted":
      return "red"
    case "renamed":
      return "blue"
    default:
      return "grey"
  }
}

const getStatusLabel = (status?: string): string => {
  switch (status) {
    case "added":
      return "Added"
    case "modified":
      return "Modified"
    case "deleted":
      return "Deleted"
    case "renamed":
      return "Renamed"
    case "untracked":
      return "Untracked"
    default:
      return "Changed"
  }
}

export default function SelectingView({
  files = [],
  selectedFiles = [],
  error = null,
  onToggleFile = () => {},
  onSelectAll = () => {},
  isAllSelected = false,
}: Props) {
  const [searchValue, setSearchValue] = useState("")
  const safeFiles = Array.isArray(files) ? files : []
  const safeSelected = Array.isArray(selectedFiles) ? selectedFiles : []
  const fileCount = safeFiles.length
  const normalizedSearchValue = searchValue.trim().toLowerCase()
  const visibleFiles = useMemo(() => {
    if (!normalizedSearchValue) {
      return safeFiles
    }

    return safeFiles.filter((file) => {
      const haystack = [
        file.name || getFileName(file.path),
        file.path,
        getFileCategory(file.path),
        getStatusLabel(file.status),
      ].join(" ").toLowerCase()

      return haystack.includes(normalizedSearchValue)
    })
  }, [normalizedSearchValue, safeFiles])

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 -mx-5 flex shrink-0 flex-col gap-2 border-b border-ui-border-base bg-ui-bg-base/95 px-5 py-3 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-x-3">
          <Text size="small" leading="compact" weight="plus">
            Workspace files
          </Text>
          {normalizedSearchValue ? (
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              {visibleFiles.length} matches
            </Text>
          ) : null}
        </div>

        <div className="flex min-w-0 items-center gap-x-2">
          <div className="relative min-w-0 flex-1 md:w-80">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ui-fg-muted" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search files"
              className="bg-ui-bg-field pl-8 pr-8"
            />
            {searchValue ? (
              <button
                type="button"
                aria-label="Clear file search"
                className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-ui-fg-muted transition-colors hover:bg-ui-bg-subtle hover:text-ui-fg-base"
                onClick={() => setSearchValue("")}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <Button size="small" variant="secondary" onClick={onSelectAll}>
            {isAllSelected ? "Clear all" : "Select all"}
          </Button>
        </div>
      </div>

      {fileCount === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
            <FileClock className="size-4 text-ui-fg-subtle" />
          </div>
          <Text size="small" leading="compact" className="mt-3 text-ui-fg-subtle">
            No changed files were returned by the Git check.
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-1 py-3">
          {visibleFiles.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center px-6 py-8 text-center">
              <Text size="small" leading="compact" weight="plus">
                No matching files
              </Text>
              <Text size="small" leading="compact" className="mt-1 text-ui-fg-subtle">
                Try another file name, path, status, or category.
              </Text>
            </div>
          ) : null}

          {visibleFiles.map((file) => {
            const isSelected = safeSelected.includes(file.path)
            const FileIcon = getFileIcon(file.path)

            return (
              <button
                key={file.path}
                type="button"
                aria-pressed={isSelected}
                className={clsx(
                  "group flex w-full items-start gap-x-3 rounded-lg border px-3 py-3 text-left outline-none transition-all hover:bg-ui-bg-component-hover focus-visible:shadow-borders-interactive-with-focus",
                  isSelected
                    ? "border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest"
                    : "border-transparent bg-ui-bg-base"
                )}
                onClick={() => onToggleFile(file.path)}
              >
                <span className="pt-1" onClick={(event) => event.stopPropagation()}>
                  <Checkbox checked={isSelected} onCheckedChange={() => onToggleFile(file.path)} />
                </span>

                <span
                  className={clsx(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border shadow-elevation-card-rest transition-colors",
                    isSelected
                      ? "border-ui-border-base bg-ui-bg-component"
                      : "border-ui-border-base bg-ui-bg-subtle"
                  )}
                >
                  <FileIcon className="size-4 text-ui-fg-base" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <Text size="small" leading="compact" weight="plus" className="min-w-0 truncate">
                      {file.name || getFileName(file.path)}
                    </Text>
                    <Badge color={getStatusColor(file.status)}>
                      {getStatusLabel(file.status)}
                    </Badge>
                  </span>
                  <Text
                    size="small"
                    leading="compact"
                    className="mt-1 truncate text-ui-fg-subtle"
                    title={file.path}
                  >
                    {truncatePath(file.path)} - {getFileCategory(file.path)}
                  </Text>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {error ? (
        <div className="mt-2 flex shrink-0 items-start gap-x-2 rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-ui-fg-error" />
          <Text size="small" leading="compact" className="text-ui-fg-error">
            {error}
          </Text>
        </div>
      ) : null}
    </div>
  )
}
