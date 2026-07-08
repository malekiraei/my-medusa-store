import { useEffect, useState } from "react"

import { Badge, Button, Container, Heading, Input, Text } from "../../../../ui/vendor"
import {
  Archive,
  CheckCircle2,
  Clock3,
  Database,
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

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Not available"
  }

  return date.toLocaleString()
}

const getFileCount = (point: RestorePoint) => {
  return typeof point.files_count === "number"
    ? point.files_count
    : point.files.length
}

const getManifestFiles = (point: RestorePoint) => {
  return Array.isArray(point.manifest_files) ? point.manifest_files : []
}

const matchesSearch = (point: RestorePoint, searchValue: string) => {
  const normalizedSearchValue = searchValue.trim().toLowerCase()

  if (!normalizedSearchValue) {
    return true
  }

  const manifestFiles = getManifestFiles(point)
  const haystack = [
    point.id,
    point.name,
    point.description,
    point.business_context,
    point.hash,
    point.storage_path,
    getUseCaseLabel(point.use_case),
    formatDate(point.created_at),
    ...point.files,
    ...manifestFiles.map((file) => file.path),
  ].filter(Boolean).join(" ").toLowerCase()

  return haystack.includes(normalizedSearchValue)
}

const formatBytes = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "0 B"
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

const DetailRow = ({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) => {
  if (value === undefined || value === null || value === "") {
    return null
  }

  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-base px-3 py-2">
      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text size="small" leading="compact" weight="plus" className="mt-1 break-all">
        {value}
      </Text>
    </div>
  )
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
      <div className="flex items-center gap-x-3 px-6 py-6">
        <div className="flex size-9 items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle">
          <Clock3 className="size-4 text-ui-fg-subtle" />
        </div>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Loading snapshot records...
        </Text>
      </div>
    </Container>
  )
}

const SnapshotDetails = ({ point }: { point: RestorePoint }) => {
  const manifestFiles = getManifestFiles(point)

  return (
    <div className="border-t border-ui-border-base bg-ui-bg-subtle/55 px-6 py-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <DetailRow label="Snapshot ID" value={point.id} />
        <DetailRow label="Name" value={point.name || "Untitled snapshot record"} />
        <DetailRow label="Use case" value={getUseCaseLabel(point.use_case)} />
        <DetailRow label="Created at" value={formatDate(point.created_at)} />
        <DetailRow label="Files" value={getFileCount(point)} />
        <DetailRow label="Captured files" value={point.captured_files_count} />
        <DetailRow label="Missing files" value={point.missing_files_count} />
        <DetailRow label="Storage path" value={point.storage_path} />
        <DetailRow label="Hash" value={point.hash} />
        <DetailRow label="Description" value={point.description} />
        <DetailRow label="Business context" value={point.business_context} />
      </div>

      <div className="mt-5 flex flex-col gap-y-3">
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
          <div className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base">
            <div className="hidden grid-cols-[minmax(0,1fr)_7rem_7rem_minmax(8rem,1fr)] gap-3 border-b border-ui-border-base bg-ui-bg-subtle px-4 py-2 md:grid">
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Path
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
                    className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_7rem_7rem_minmax(8rem,1fr)] md:items-center"
                  >
                    <div className="flex min-w-0 items-start gap-x-3">
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
                        <Archive className="size-3.5 text-ui-fg-subtle" />
                      </div>
                      <Text size="small" leading="compact" weight="plus" className="break-all">
                        {file.path}
                      </Text>
                    </div>

                    <div className="flex items-center gap-x-2">
                      <FileStatusIcon
                        className={isCaptured ? "size-4 text-ui-fg-success" : "size-4 text-ui-fg-warning"}
                      />
                      <Badge color={isCaptured ? "green" : "orange"}>
                        {file.status}
                      </Badge>
                    </div>

                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {formatBytes(file.size)}
                    </Text>

                    <Text size="small" leading="compact" className="break-all text-ui-fg-subtle">
                      {file.sha256 || "Not available"}
                    </Text>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
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
  const fileCount = getFileCount(point)

  return (
    <div className="bg-ui-bg-base">
      <div className="flex flex-col gap-y-3 px-6 py-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-x-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
            <Database className="size-4 text-ui-fg-subtle" />
          </div>

          <div className="flex min-w-0 flex-col gap-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Text size="small" leading="compact" weight="plus">
                {point.name || "Untitled snapshot record"}
              </Text>
              <Badge color="blue">Snapshot</Badge>
            </div>

            {(point.description || point.business_context) ? (
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                {point.description || point.business_context}
              </Text>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-x-1">
                <Clock3 className="size-3.5 text-ui-fg-muted" />
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  {formatDate(point.created_at)}
                </Text>
              </div>

              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                {getUseCaseLabel(point.use_case)}
              </Text>

              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                {fileCount} files
              </Text>

              {typeof point.captured_files_count === "number" ? (
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  {point.captured_files_count} captured
                </Text>
              ) : null}

              {typeof point.missing_files_count === "number" ? (
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  {point.missing_files_count} missing
                </Text>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-y-2 md:items-end">
          {point.hash ? (
            <Text
              size="small"
              leading="compact"
              className="break-all text-ui-fg-subtle md:max-w-xs md:text-right"
            >
              {point.hash}
            </Text>
          ) : null}

          <Button variant="secondary" size="small" onClick={onToggle}>
            {isSelected ? "Hide manifest" : "View manifest"}
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
  const visiblePoints = points.filter((point) => matchesSearch(point, searchValue))
  const normalizedSearchValue = searchValue.trim()

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
    }
  }, [points, revealPointId])

  if (loading && points.length === 0) {
    return <LoadingState />
  }

  if (points.length === 0) {
    return <EmptyState />
  }

  return (
    <Container className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 border-b border-ui-border-base px-6 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-x-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle">
            <FileClock className="size-4 text-ui-fg-subtle" />
          </div>
          <div className="min-w-0">
            <Heading level="h2">Snapshot Records</Heading>
            <Text size="small" leading="compact" className="mt-1 text-ui-fg-subtle">
              File-backed snapshots created from selected workspace files.
            </Text>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <div className="relative min-w-0 flex-1 lg:w-80">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ui-fg-muted" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search records"
              className="pl-8 pr-8"
            />
            {searchValue ? (
              <button
                type="button"
                aria-label="Clear record search"
                className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-ui-fg-muted transition-colors hover:bg-ui-bg-subtle hover:text-ui-fg-base"
                onClick={() => setSearchValue("")}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <Badge color="grey">
            {normalizedSearchValue
              ? `${visiblePoints.length} of ${points.length}`
              : `${points.length} records`}
          </Badge>
        </div>
      </div>

      <div className="divide-y divide-ui-border-base">
        {visiblePoints.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center px-6 py-10 text-center">
            <Text size="small" leading="compact" weight="plus">
              No matching records
            </Text>
            <Text size="small" leading="compact" className="mt-1 text-ui-fg-subtle">
              Try another name, path, hash, use case, or date.
            </Text>
          </div>
        ) : null}

        {visiblePoints.map((point) => (
          <TimelineItem
            key={point.id}
            point={point}
            isSelected={selectedPointId === point.id}
            onToggle={() =>
              setSelectedPointId((current) =>
                current === point.id ? null : point.id
              )
            }
          />
        ))}
      </div>
    </Container>
  )
}

export default RestoreTimeline
