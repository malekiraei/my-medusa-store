import { Badge, Button, Checkbox, Container, Text, clsx } from "../../../../../ui/vendor"
import {
  Archive,
  Database,
  FileClock,
  Package,
  Shield,
  TriangleAlert,
} from "../../../../../ui/vendor/lucide"
import { ViewHeader } from "./ViewHeader"

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

const truncatePath = (path: string, maxLength: number = 62): string => {
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
  const safeFiles = Array.isArray(files) ? files : []
  const safeSelected = Array.isArray(selectedFiles) ? selectedFiles : []
  const fileCount = safeFiles.length
  const selectedCount = safeSelected.length

  return (
    <div className="flex h-full flex-col">
      <ViewHeader
        icon={<FileClock className="size-4" />}
        title="Choose files to capture"
        subtitle={`${fileCount} changed files found · ${selectedCount} selected`}
        tone="blue"
      />

      <div className="flex-1 overflow-y-auto py-4">
        <Container className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-x-3 border-b border-ui-border-base px-4 py-3">
            <div className="flex min-w-0 flex-col gap-y-1">
              <Text size="small" leading="compact" weight="plus">
                Changed workspace files
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Only selected files will be written to the file-backed snapshot record.
              </Text>
            </div>

            <Button size="small" variant="secondary" onClick={onSelectAll}>
              {isAllSelected ? "Clear all" : "Select all"}
            </Button>
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
            <div className="max-h-[430px] divide-y divide-ui-border-base overflow-y-auto">
              {safeFiles.map((file) => {
                const isSelected = safeSelected.includes(file.path)
                const FileIcon = getFileIcon(file.path)

                return (
                  <button
                    key={file.path}
                    type="button"
                    aria-pressed={isSelected}
                    className={clsx(
                      "flex w-full items-start gap-x-3 px-4 py-3 text-left outline-none transition-colors hover:bg-ui-bg-subtle focus-visible:shadow-borders-interactive-with-focus",
                      isSelected ? "bg-ui-bg-subtle/60" : "bg-ui-bg-base"
                    )}
                    onClick={() => onToggleFile(file.path)}
                  >
                    <span onClick={(event) => event.stopPropagation()}>
                      <Checkbox checked={isSelected} onCheckedChange={() => onToggleFile(file.path)} />
                    </span>

                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
                      <FileIcon className="size-4 text-ui-fg-subtle" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Text size="small" leading="compact" weight="plus" className="truncate">
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
                        {truncatePath(file.path)} · {getFileCategory(file.path)}
                      </Text>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </Container>
      </div>

      {error ? (
        <div className="mt-2 flex items-start gap-x-2 rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-ui-fg-error" />
          <Text size="small" leading="compact" className="text-ui-fg-error">
            {error}
          </Text>
        </div>
      ) : null}
    </div>
  )
}
