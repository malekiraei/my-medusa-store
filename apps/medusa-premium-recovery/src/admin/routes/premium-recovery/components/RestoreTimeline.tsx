import { useEffect, useMemo, useState } from "react"

import { Badge, Button, Container, Heading, Input, Select, Text } from "../../../../ui/vendor"
import {
  Archive,
  CheckCircle2,
  FileClock,
  Search,
  TriangleAlert,
  X,
} from "../../../../ui/vendor/lucide"
import type { SnapshotRecord } from "../types/snapshot-workflow"

export type RestorePoint = SnapshotRecord

type RestoreTimelineProps = {
  points: RestorePoint[]
  loading: boolean
  revealPointId?: string | null
}

const getUseCaseLabel = (useCase: RestorePoint["use_case"]) => {
  switch (useCase) {
    case "before_update":
      return "Before update"
    case "before_theme_change":
      return "Before theme change"
    case "before_plugin_install":
      return "Before plugin install"
    case "manual":
      return "Manual"
    default:
      return "Not available"
  }
}

const getSnapshotModeLabel = (point: RestorePoint) => {
  const record = point as RestorePoint & {
    mode?: string | null
    snapshot_mode?: string | null
    type?: string | null
    snapshot_type?: string | null
  }
  const rawMode =
    record.mode ??
    record.snapshot_mode ??
    record.type ??
    record.snapshot_type

  if (typeof rawMode === "string" && rawMode.trim()) {
    return rawMode.trim()
  }

  return "Manual"
}

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Not available"
  }

  return date.toLocaleString()
}

const formatDateParts = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return { date: "Not available", time: null }
  }

  return {
    date: date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  }
}

const getFileCount = (point: RestorePoint) => {
  return typeof point.files_count === "number"
    ? point.files_count
    : point.files.length
}

const getManifestFiles = (point: RestorePoint) => {
  return Array.isArray(point.manifest_files) ? point.manifest_files : []
}

type SnapshotRecordStatus = {
  label: "Complete" | "Partial" | "Missing" | "Empty" | "Unknown"
  color: "green" | "orange" | "red" | "grey"
}

type SortValue = "newest" | "oldest" | "name"
type StatusFilterValue = "all" | "complete" | "partial" | "failed"
type PageSizeValue = "10" | "25" | "50"

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
]

const STATUS_FILTER_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "complete", label: "Complete" },
  { value: "partial", label: "Partial" },
  { value: "failed", label: "Failed" },
]

const PAGE_SIZE_OPTIONS: { value: PageSizeValue; label: string }[] = [
  { value: "10", label: "10 / page" },
  { value: "25", label: "25 / page" },
  { value: "50", label: "50 / page" },
]

const getRecordCounts = (point: RestorePoint) => {
  const manifestFiles = getManifestFiles(point)
  const totalFiles = getFileCount(point)
  const canDeriveFromManifest = manifestFiles.length > 0 || totalFiles === 0
  const capturedCount =
    typeof point.captured_files_count === "number"
      ? point.captured_files_count
      : canDeriveFromManifest
        ? manifestFiles.filter((file) => file.status === "captured").length
        : null
  const missingCount =
    typeof point.missing_files_count === "number"
      ? point.missing_files_count
      : canDeriveFromManifest
        ? manifestFiles.filter((file) => file.status === "missing").length
        : null

  return {
    total: totalFiles,
    captured: capturedCount,
    missing: missingCount,
  }
}

const getRecordStatus = (point: RestorePoint): SnapshotRecordStatus => {
  const { captured: capturedCount, missing: missingCount } = getRecordCounts(point)

  if (capturedCount === null || missingCount === null) {
    return { label: "Unknown", color: "grey" }
  }

  if (capturedCount > 0 && missingCount === 0) {
    return { label: "Complete", color: "green" }
  }

  if (capturedCount > 0 && missingCount > 0) {
    return { label: "Partial", color: "orange" }
  }

  if (capturedCount === 0 && missingCount > 0) {
    return { label: "Missing", color: "red" }
  }

  return { label: "Empty", color: "grey" }
}

const getStatusFilterValue = (point: RestorePoint): Exclude<StatusFilterValue, "all"> | "other" => {
  const status = getRecordStatus(point)

  if (status.label === "Complete") return "complete"
  if (status.label === "Partial") return "partial"
  if (status.color === "red") return "failed"

  return "other"
}

const statusAccentClass: Record<SnapshotRecordStatus["color"], string> = {
  green: "bg-ui-fg-success",
  orange: "bg-ui-fg-warning",
  red: "bg-ui-fg-error",
  grey: "bg-ui-border-strong",
}

const statusProgressClass: Record<SnapshotRecordStatus["color"], string> = {
  green: "bg-ui-fg-success",
  orange: "bg-ui-fg-warning",
  red: "bg-ui-fg-error",
  grey: "bg-ui-border-strong",
}

const matchesSearch = (point: RestorePoint, searchValue: string) => {
  const normalizedSearchValue = searchValue.trim().toLowerCase()

  if (!normalizedSearchValue) {
    return true
  }

  const haystack = [
    point.name,
    getUseCaseLabel(point.use_case),
    formatDate(point.created_at),
  ].filter(Boolean).join(" ").toLowerCase()

  return haystack.includes(normalizedSearchValue)
}

const sortRestorePoints = (points: RestorePoint[], sortValue: SortValue) => {
  const sorted = [...points]

  if (sortValue === "name") {
    return sorted.sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
    )
  }

  return sorted.sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    const safeATime = Number.isNaN(aTime) ? 0 : aTime
    const safeBTime = Number.isNaN(bTime) ? 0 : bTime

    return sortValue === "oldest"
      ? safeATime - safeBTime
      : safeBTime - safeATime
  })
}

const formatBytes = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "0 B"
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

const EmptyState = () => {
  return (
    <Container className="overflow-hidden p-0">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="flex max-w-md flex-col items-center gap-y-3 text-center">
          <div className="flex size-11 items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
            <FileClock className="size-5 text-ui-fg-subtle" />
          </div>

          <div className="flex flex-col gap-y-1">
            <Text size="small" leading="compact" weight="plus">
              No snapshot records yet
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              File-backed records created by the snapshot wizard will appear here.
            </Text>
          </div>
        </div>
      </div>
    </Container>
  )
}

const LoadingState = () => {
  return (
    <Container className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-ui-border-base px-6 py-4">
        <div className="flex items-center gap-x-3">
          <div className="size-9 rounded-lg bg-ui-bg-subtle" />
          <div className="space-y-2">
            <div className="h-4 w-36 rounded-md bg-ui-bg-subtle" />
            <div className="h-3 w-56 rounded-md bg-ui-bg-subtle" />
          </div>
        </div>
        <div className="hidden h-8 w-80 rounded-md bg-ui-bg-subtle md:block" />
      </div>

      <div className="flex flex-col gap-2.5 bg-ui-bg-subtle px-6 py-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="min-h-[96px] rounded-lg border border-ui-border-base bg-ui-bg-base p-3"
          >
            <div className="flex items-start gap-x-2.5">
              <div className="size-8 rounded-md bg-ui-bg-subtle" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-x-2">
                  <div className="h-3.5 w-32 rounded-md bg-ui-bg-subtle" />
                  <div className="h-4 w-16 rounded-full bg-ui-bg-subtle" />
                </div>
                <div className="h-3 w-60 rounded-md bg-ui-bg-subtle" />
                <div className="flex items-center justify-between gap-x-3">
                  <div className="h-[3px] w-28 rounded-full bg-ui-bg-subtle" />
                  <div className="h-6 w-24 rounded-md bg-ui-bg-subtle" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}

const SnapshotDetails = ({ point }: { point: RestorePoint }) => {
  const manifestFiles = getManifestFiles(point)
  const counts = getRecordCounts(point)
  const capturedValue = counts.captured ?? point.captured_files_count ?? "Unknown"
  const missingValue = counts.missing ?? point.missing_files_count ?? "Unknown"
  const readiness = point.restore_readiness
  const readinessTone =
    readiness?.status === "Restorable"
      ? "green"
      : readiness?.status === "Restorable with warnings"
        ? "orange"
        : "red"

  return (
    <div className="border-t border-ui-border-base bg-ui-bg-subtle/55 px-3 py-2.5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2">
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Created
        </Text>
        <Text size="small" leading="compact" weight="plus" className="tabular-nums">
          {formatDate(point.created_at)}
        </Text>
        <span className="h-3 w-px bg-ui-border-base" />
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Use case
        </Text>
        <Text size="small" leading="compact" weight="plus">
          {getUseCaseLabel(point.use_case)}
        </Text>
        <span className="h-3 w-px bg-ui-border-base" />
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Files
        </Text>
        <Text size="small" leading="compact" weight="plus" className="tabular-nums">
          {capturedValue} captured / {missingValue} missing / {counts.total} total
        </Text>
      </div>

      {readiness ? (
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Restore readiness
          </Text>
          <Badge color={readinessTone} size="small">
            {readiness.status}
          </Badge>
          <span className="h-3 w-px bg-ui-border-base" />
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Files
          </Text>
          <Text size="small" leading="compact" weight="plus" className="tabular-nums">
            {readiness.restorable_files_count} restorable / {readiness.warning_files_count} warning / {readiness.not_restorable_files_count} blocked
          </Text>
        </div>
      ) : null}

      {(point.description || point.business_context) ? (
        <div className="mt-2 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {point.description ? "Description" : "Business context"}
          </Text>
          <Text
            size="small"
            leading="compact"
            weight="plus"
            className="mt-0.5 line-clamp-2 break-words [overflow-wrap:anywhere]"
            title={point.description || point.business_context || undefined}
          >
            {point.description || point.business_context}
          </Text>
        </div>
      ) : null}

      <div className="mt-2 flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-3">
          <Text size="small" leading="compact" weight="plus">
            Manifest files
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {manifestFiles.length} entries
          </Text>
        </div>

        {manifestFiles.length === 0 ? (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            File manifest details are not available for this snapshot record.
          </Text>
        ) : (
          <div className="max-h-72 overflow-auto rounded-md border border-ui-border-base bg-ui-bg-base">
            <div className="sticky top-0 z-10 grid min-w-[760px] grid-cols-[minmax(18rem,1.7fr)_7rem_4.75rem_3.5rem_minmax(4.5rem,6.5rem)] items-center gap-x-2 border-b border-ui-border-base bg-ui-bg-subtle px-3 py-1.5">
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Path
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Scope
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Status
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Size
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                SHA-256
              </Text>
            </div>

            <div className="divide-y divide-ui-border-base">
              {manifestFiles.map((file) => {
                const isCaptured = file.status === "captured"
                const FileStatusIcon = isCaptured ? CheckCircle2 : TriangleAlert

                return (
                  <div
                    key={file.path}
                    className="grid min-w-[760px] grid-cols-[minmax(18rem,1.7fr)_7rem_4.75rem_3.5rem_minmax(4.5rem,6.5rem)] items-center gap-x-2 px-3 py-1.5 transition-colors hover:bg-ui-bg-base-hover"
                  >
                    <div className="flex min-w-0 items-center gap-x-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
                        <Archive className="size-3.5 text-ui-fg-subtle" />
                      </div>
                      <Text
                        size="small"
                        leading="compact"
                        weight="plus"
                        className="min-w-0 truncate [overflow-wrap:normal]"
                        title={file.path}
                      >
                        {file.path}
                      </Text>
                    </div>

                    <Text
                      size="small"
                      leading="compact"
                      className="truncate text-ui-fg-subtle"
                      title={file.workspace_scope || "Legacy"}
                    >
                      {file.workspace_scope || "Legacy"}
                    </Text>

                    <div className="flex min-w-0 items-center gap-x-1">
                      <FileStatusIcon
                        className={isCaptured ? "size-3.5 shrink-0 text-ui-fg-success" : "size-3.5 shrink-0 text-ui-fg-warning"}
                      />
                      <Badge
                        color={isCaptured ? "green" : "orange"}
                        size="small"
                        className="max-w-full truncate px-1.5"
                      >
                        {file.status}
                      </Badge>
                    </div>

                    <Text size="small" leading="compact" className="truncate text-ui-fg-subtle">
                      {formatBytes(file.size)}
                    </Text>

                    <Text
                      size="small"
                      leading="compact"
                      className="min-w-0 rounded-md bg-ui-bg-subtle px-1.5 py-0.5 font-mono text-[11px] leading-4 text-ui-fg-subtle truncate"
                      title={file.sha256 || "Not available"}
                    >
                      {file.sha256 || "Not available"}
                    </Text>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <details className="mt-2 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2">
        <summary className="cursor-pointer text-ui-fg-subtle">
          <Text as="span" size="small" leading="compact" weight="plus">
            Technical details
          </Text>
        </summary>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[
            ["Snapshot ID", point.id],
            ["Storage path", point.storage_path || "Not available"],
            ["Hash", point.hash || "Not available"],
            ["Policy version", point.policy_version || readiness?.policy_version || "Legacy"],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-md bg-ui-bg-subtle px-2 py-1.5">
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                {label}
              </Text>
              <Text
                size="small"
                leading="compact"
                weight="plus"
                className="truncate font-mono text-[11px]"
                title={value}
              >
                {value}
              </Text>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

const TimelineItem = ({
  point,
  isSelected,
  onToggle,
}: {
  point: RestorePoint
  isSelected: boolean
  onToggle: () => void
}) => {
  const counts = getRecordCounts(point)
  const status = getRecordStatus(point)
  const created = formatDateParts(point.created_at)
  const createdLabel = created.time
    ? `${created.date} ${created.time}`
    : created.date
  const filesValue =
    counts.captured === null
      ? `${counts.total} files`
      : `${counts.captured} of ${counts.total} files captured`
  const modeLabel = getSnapshotModeLabel(point)
  const progressValue =
    counts.captured !== null && counts.total > 0
      ? Math.max(0, Math.min(100, (counts.captured / counts.total) * 100))
      : null
  const showProgress = progressValue !== null

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border bg-ui-bg-base shadow-elevation-card-rest transition-colors hover:border-ui-border-strong hover:bg-ui-bg-base-hover ${isSelected ? "border-ui-border-strong" : "border-ui-border-base"}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${statusAccentClass[status.color]}`} />

      <div className="flex min-h-[96px] flex-col gap-2.5 p-3 pl-4">
        <div className="flex min-w-0 items-start gap-x-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
            <Archive className="size-3.5 text-ui-fg-subtle" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-y-1">
            <div className="flex min-w-0 items-center justify-between gap-x-3">
              <Text
                size="small"
                leading="compact"
                weight="plus"
                className="min-w-0 truncate text-ui-fg-base"
                title={point.name || "Untitled snapshot record"}
              >
                {point.name || "Untitled snapshot record"}
              </Text>
              <Badge
                color={status.color}
                size="small"
                className="inline-flex shrink-0 rounded-full px-1.5 py-0 text-[11px] leading-4 shadow-none ring-1 ring-ui-border-base"
              >
                {status.label}
              </Badge>
            </div>

            <Text
              size="small"
              leading="compact"
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ui-fg-subtle"
            >
              <span>{createdLabel}</span>
              <span className="text-ui-fg-muted">{"\u2022"}</span>
              <span>{modeLabel}</span>
              <span className="text-ui-fg-muted">{"\u2022"}</span>
              <span className="tabular-nums">{filesValue}</span>
            </Text>
          </div>
        </div>

        <div className="flex items-center justify-between gap-x-4 pl-10">
          <div className="min-w-0 flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-ui-bg-subtle ring-1 ring-ui-border-base">
              <div
                className={`h-full rounded-full ${statusProgressClass[status.color]}`}
                style={{ width: `${showProgress ? progressValue : 0}%` }}
              />
            </div>
          </div>

          <Text size="small" leading="compact" className="shrink-0 text-ui-fg-subtle tabular-nums">
            {counts.captured ?? 0}/{counts.total}
          </Text>

          <Button
            variant="transparent"
            size="small"
            onClick={onToggle}
            aria-expanded={isSelected}
            className="h-6 whitespace-nowrap px-1.5 text-ui-fg-subtle shadow-none hover:bg-ui-bg-subtle hover:text-ui-fg-base focus-visible:shadow-borders-interactive-with-focus"
          >
            <span>{isSelected ? "Hide details" : "View details"}</span>
            <span aria-hidden="true" className="ml-1 text-ui-fg-muted">
              {"\u203A"}
            </span>
          </Button>
        </div>
      </div>

      {isSelected ? <SnapshotDetails point={point} /> : null}
    </div>
  )
}

export const RestoreTimeline = ({
  points,
  loading,
  revealPointId = null,
}: RestoreTimelineProps) => {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("")
  const [sortValue, setSortValue] = useState<SortValue>("newest")
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all")
  const [pageSize, setPageSize] = useState<PageSizeValue>("10")
  const [pageIndex, setPageIndex] = useState(0)
  const visiblePoints = useMemo(() => {
    const searched = points.filter((point) => matchesSearch(point, debouncedSearchValue))
    const filtered =
      statusFilter === "all"
        ? searched
        : searched.filter((point) => getStatusFilterValue(point) === statusFilter)

    return sortRestorePoints(filtered, sortValue)
  }, [points, debouncedSearchValue, sortValue, statusFilter])
  const numericPageSize = Number(pageSize)
  const pageCount = Math.max(1, Math.ceil(visiblePoints.length / numericPageSize))
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const pageStart = safePageIndex * numericPageSize
  const pageEnd = Math.min(pageStart + numericPageSize, visiblePoints.length)
  const paginatedPoints = visiblePoints.slice(pageStart, pageEnd)
  const controlsAreFiltering =
    Boolean(debouncedSearchValue.trim()) || statusFilter !== "all"

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, 150)

    return () => window.clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    setPageIndex(0)
  }, [debouncedSearchValue, sortValue, statusFilter, pageSize])

  useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(pageCount - 1)
    }
  }, [pageCount, pageIndex])

  useEffect(() => {
    if (!revealPointId || points.length === 0) {
      return
    }

    const pointToReveal =
      revealPointId === "__latest__"
        ? points[0]
        : points.find((point) => point.id === revealPointId)

    if (pointToReveal) {
      setSelectedPointId(pointToReveal.id)
      const sortedIndex = visiblePoints.findIndex((point) => point.id === pointToReveal.id)

      if (sortedIndex >= 0) {
        setPageIndex(Math.floor(sortedIndex / numericPageSize))
      }
    }
  }, [numericPageSize, points, revealPointId, visiblePoints])

  if (loading && points.length === 0) {
    return <LoadingState />
  }

  if (points.length === 0) {
    return <EmptyState />
  }

  return (
    <Container className="overflow-hidden p-0">
      <div className="border-b border-ui-border-base px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-x-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle">
              <FileClock className="size-4 text-ui-fg-subtle" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Heading level="h2">Snapshot Records</Heading>
                <Badge color="grey">
                  {controlsAreFiltering
                    ? `${visiblePoints.length} of ${points.length}`
                    : `${points.length} records`}
                </Badge>
              </div>
              <Text size="small" leading="compact" className="mt-1 text-ui-fg-subtle">
                File-backed snapshots created from selected workspace files.
              </Text>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            <div className="relative min-w-[14rem] flex-1 xl:w-64 xl:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ui-fg-muted" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search records"
                aria-label="Search snapshot records"
                className="h-8 pl-8 pr-8"
              />
              {searchValue ? (
                <button
                  type="button"
                  aria-label="Clear record search"
                  className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-ui-fg-muted transition-colors hover:bg-ui-bg-subtle hover:text-ui-fg-base focus-visible:shadow-borders-interactive-with-focus"
                  onClick={() => setSearchValue("")}
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>

            <div className="min-w-[8.5rem] flex-1 xl:flex-none">
              <Select
                value={sortValue}
                onValueChange={(value) => setSortValue(value as SortValue)}
              >
                <Select.Trigger
                  aria-label="Sort snapshot records"
                  className="h-8 bg-ui-bg-field"
                >
                  <span className="text-ui-fg-muted">Sort:</span>
                  <Select.Value placeholder="Sort" />
                </Select.Trigger>
                <Select.Content>
                  {SORT_OPTIONS.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="min-w-[9rem] flex-1 xl:flex-none">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilterValue)}
              >
                <Select.Trigger
                  aria-label="Filter snapshot records by status"
                  className="h-8 bg-ui-bg-field"
                >
                  <span className="text-ui-fg-muted">Status:</span>
                  <Select.Value placeholder="Status" />
                </Select.Trigger>
                <Select.Content>
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="min-w-[8.5rem] flex-1 xl:flex-none">
              <Select
                value={pageSize}
                onValueChange={(value) => setPageSize(value as PageSizeValue)}
              >
                <Select.Trigger
                  aria-label="Snapshot records per page"
                  className="h-8 bg-ui-bg-field"
                >
                  <Select.Value placeholder="Page size" />
                </Select.Trigger>
                <Select.Content>
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div>
        {visiblePoints.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center px-6 py-10 text-center">
            <Text size="small" leading="compact" weight="plus">
              No matching records
            </Text>
            <Text size="small" leading="compact" className="mt-1 text-ui-fg-subtle">
              Try another name, status, sort order, or date.
            </Text>
          </div>
        ) : null}

        {visiblePoints.length > 0 ? (
          <div className="bg-ui-bg-subtle px-6 py-4">
            <div className="flex flex-col gap-2.5">
              {paginatedPoints.map((point) => {
                const isSelected = selectedPointId === point.id

                return (
                  <TimelineItem
                    key={point.id}
                    point={point}
                    isSelected={isSelected}
                    onToggle={() => setSelectedPointId(isSelected ? null : point.id)}
                  />
                )
              })}
            </div>

            <div className="mt-3 flex flex-col gap-2 border-t border-ui-border-base pt-3 sm:flex-row sm:items-center sm:justify-between">
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Showing {pageStart + 1}-{pageEnd} of {visiblePoints.length} records
              </Text>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="small"
                  disabled={safePageIndex === 0}
                  onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
                >
                  Previous
                </Button>
                <Text size="small" leading="compact" className="min-w-16 text-center text-ui-fg-subtle">
                  Page {safePageIndex + 1} / {pageCount}
                </Text>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={safePageIndex >= pageCount - 1}
                  onClick={() => setPageIndex((current) => Math.min(pageCount - 1, current + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Container>
  )
}

export default RestoreTimeline
