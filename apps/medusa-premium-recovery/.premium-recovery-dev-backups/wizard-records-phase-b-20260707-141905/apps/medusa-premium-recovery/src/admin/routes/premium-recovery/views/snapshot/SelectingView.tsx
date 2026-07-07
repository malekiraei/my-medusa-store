import { Badge, Button, Container, Text, clsx } from "../../../../../ui/vendor"
import {
  Archive,
  CheckCircle2,
  Database,
  FileClock,
  Package,
  Shield,
  TriangleAlert,
} from "../../../../../ui/vendor/lucide"
import { ViewHeader } from "./ViewHeader"

type FileItem = {
  path: string
  name: string
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

const truncatePath = (path: string, maxLength: number = 48): string => {
  if (!path) {
    return ""
  }

  if (path.length <= maxLength) {
    return path
  }

  const normalized = path.replace(/\\/g, "/")
  const parts = normalized.split("/")

  if (parts.length <= 2) {
    return `${path.substring(0, maxLength)}...`
  }

  return `.../${parts.slice(-2).join("/")}`
}

const getFileCategory = (path: string): string => {
  const normalized = path.toLowerCase().replace(/\\/g, "/")
  const fileName = normalized.split("/").pop() || normalized

  if (fileName === ".env" || fileName === ".env.example") {
    return "تنظیمات محیط"
  }

  if (
    fileName === "package.json" ||
    fileName.includes("tsconfig") ||
    fileName.includes("vite") ||
    fileName.includes("eslint") ||
    fileName.includes("tailwind") ||
    fileName.includes("postcss") ||
    fileName.includes("medusa-config")
  ) {
    return "پیکربندی پروژه"
  }

  if (
    fileName.startsWith("readme") ||
    fileName.endsWith(".md") ||
    normalized.startsWith("docs/") ||
    normalized.includes("/docs/")
  ) {
    return "مستندات"
  }

  if (
    normalized.startsWith("public/") ||
    normalized.includes("/public/") ||
    normalized.startsWith("static/") ||
    normalized.includes("/static/") ||
    /\.(png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|mp4|webm|mp3|wav)$/i.test(fileName)
  ) {
    return "فایل عمومی"
  }

  if (
    normalized.startsWith("admin/") ||
    normalized.includes("/admin/") ||
    normalized.startsWith("routes/") ||
    normalized.includes("/routes/") ||
    normalized.startsWith("components/") ||
    normalized.includes("/components/") ||
    normalized.startsWith("views/") ||
    normalized.includes("/views/")
  ) {
    return "رابط مدیریت"
  }

  if (
    normalized.startsWith("src/") ||
    normalized.includes("/src/") ||
    normalized.startsWith("lib/") ||
    normalized.includes("/lib/") ||
    normalized.startsWith("server/") ||
    normalized.includes("/server/") ||
    normalized.startsWith("api/") ||
    normalized.includes("/api/") ||
    normalized.startsWith("modules/") ||
    normalized.includes("/modules/")
  ) {
    return "کد منبع"
  }

  return "سایر فایل‌ها"
}

const getFileIcon = (path: string) => {
  const normalized = path.toLowerCase().replace(/\\/g, "/")
  const fileName = normalized.split("/").pop() || normalized
  const ext = fileName.split(".").pop() || ""

  if (fileName === ".env" || fileName.includes(".env")) {
    return Shield
  }

  if (["json", "yaml", "yml", "lock"].includes(ext)) {
    return Database
  }

  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "ico", "zip"].includes(ext)) {
    return Archive
  }

  if (normalized.includes("/components/") || normalized.includes("/views/")) {
    return Package
  }

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
    case "untracked":
    default:
      return "grey"
  }
}

const getStatusLabel = (status?: string): string => {
  switch (status) {
    case "added":
      return "افزوده شده"
    case "modified":
      return "تغییر یافته"
    case "deleted":
      return "حذف شده"
    case "renamed":
      return "تغییر نام داده شده"
    case "untracked":
      return "ردیابی نشده"
    default:
      return ""
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
        title="انتخاب فایل‌ها"
        subtitle={`${fileCount} فایل · ${selectedCount} انتخاب شده`}
        tone="blue"
      />

      <div className="flex-1 overflow-y-auto py-4">
        <Container className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-x-3 border-b border-ui-border-base px-4 py-3">
            <div className="flex min-w-0 flex-col gap-y-1">
              <Text size="small" leading="compact" weight="plus">
                تغییرات قابل ثبت
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                فقط فایل‌های انتخاب‌شده در اسنپ‌شات ذخیره می‌شوند.
              </Text>
            </div>

            <Button size="small" variant="secondary" onClick={onSelectAll}>
              انتخاب همه
            </Button>
          </div>

          {fileCount === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center px-6 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
                <FileClock className="size-4 text-ui-fg-subtle" />
              </div>
              <Text size="small" leading="compact" className="mt-3 text-ui-fg-subtle">
                فایل تغییریافته‌ای یافت نشد
              </Text>
            </div>
          ) : (
            <div className="divide-y divide-ui-border-base">
              {safeFiles.map((file) => {
                const isSelected = safeSelected.includes(file.path)
                const FileIcon = getFileIcon(file.path)

                return (
                  <button
                    key={file.path}
                    type="button"
                    aria-pressed={isSelected}
                    className="flex w-full items-center gap-x-3 px-4 py-3 text-left outline-none transition-colors hover:bg-ui-bg-subtle focus-visible:shadow-borders-interactive-with-focus"
                    onClick={() => onToggleFile(file.path)}
                  >
                    <span
                      className={clsx(
                        "flex size-5 flex-shrink-0 items-center justify-center rounded-full border",
                        isSelected
                          ? "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-on-color"
                          : "border-ui-border-base bg-ui-bg-base text-transparent"
                      )}
                    >
                      <CheckCircle2 className="size-3.5" />
                    </span>

                    <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
                      <FileIcon className="size-4 text-ui-fg-subtle" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Text size="small" leading="compact" weight="plus" className="truncate">
                          {file.path.split("/").pop()}
                        </Text>
                        {file.status && (
                          <Badge color={getStatusColor(file.status)}>
                            {getStatusLabel(file.status)}
                          </Badge>
                        )}
                      </span>
                      <Text
                        size="small"
                        leading="compact"
                        className="truncate text-ui-fg-subtle"
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

      {error && (
        <div className="mt-2 flex items-start gap-x-2 rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
          <TriangleAlert className="mt-0.5 size-4 flex-shrink-0 text-ui-fg-error" />
          <Text size="small" leading="compact" className="text-ui-fg-error">
            {error}
          </Text>
        </div>
      )}
    </div>
  )
}
