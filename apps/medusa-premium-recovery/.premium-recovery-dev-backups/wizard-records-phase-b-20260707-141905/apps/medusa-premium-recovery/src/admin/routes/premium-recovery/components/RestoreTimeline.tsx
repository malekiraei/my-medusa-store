import { useState } from "react"

import { Badge, Button, Container, Heading, Text } from "../../../../ui/vendor"
import {
  Archive,
  CheckCircle2,
  Clock3,
  Database,
  FileClock,
  TriangleAlert,
} from "../../../../ui/vendor/lucide"
import type {
  SnapshotFileManifest,
  SnapshotRecord,
} from "../types/snapshot-workflow"

export type RestorePoint = SnapshotRecord

type RestoreTimelineProps = {
  points: RestorePoint[]
  loading: boolean
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

const formatBytes = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 B"
  }

  if (value < 1024) {
    return `${value} B`
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`
  }

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
    <div className="flex flex-col gap-y-1">
      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text size="small" leading="compact" weight="plus" className="break-all">
        {value}
      </Text>
    </div>
  )
}

const EmptyState = () => {
  return (
    <Container className="p-0">
      <div className="flex items-center justify-center px-6 py-10">
        <div className="flex max-w-md flex-col items-center gap-y-3 text-center">
          <div className="flex size-10 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
            <FileClock className="size-4 text-ui-fg-subtle" />
          </div>

          <div className="flex flex-col gap-y-1">
            <Text size="small" leading="compact" weight="plus">
              No snapshot records yet
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              File-backed snapshot records created by the snapshot wizard will appear here.
            </Text>
          </div>
        </div>
      </div>
    </Container>
  )
}

const LoadingState = () => {
  return (
    <Container className="p-0">
      <div className="flex items-center gap-x-3 px-6 py-6">
        <div className="flex size-8 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
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
    <div className="border-t border-ui-border-base bg-ui-bg-subtle px-6 py-5">
      <div className="grid gap-4 md:grid-cols-2">
        <DetailRow label="Snapshot ID" value={point.id} />
        <DetailRow label="Name" value={point.name || "Untitled snapshot record"} />
        <DetailRow label="Description" value={point.description} />
        <DetailRow label="Business Context" value={point.business_context} />
        <DetailRow label="Use Case" value={getUseCaseLabel(point.use_case)} />
        <DetailRow label="Created At" value={formatDate(point.created_at)} />
        <DetailRow label="Hash" value={point.hash} />
        <DetailRow label="Files Count" value={getFileCount(point)} />
        <DetailRow label="Captured Files Count" value={point.captured_files_count} />
        <DetailRow label="Missing Files Count" value={point.missing_files_count} />
        <DetailRow label="Storage Path" value={point.storage_path} />
      </div>

      <div className="mt-5 flex flex-col gap-y-3">
        <Text size="small" leading="compact" weight="plus">
          Manifest Files
        </Text>

        {manifestFiles.length === 0 ? (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            File manifest details are not available for this snapshot record.
          </Text>
        ) : (
          <div className="divide-y divide-ui-border-base overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-base">
            {manifestFiles.map((file) => {
              const isCaptured = file.status === "captured"
              const FileStatusIcon = isCaptured ? CheckCircle2 : TriangleAlert

              return (
                <div
                  key={file.path}
                  className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_7rem_minmax(5rem,7rem)_minmax(0,1fr)] md:items-center"
                >
                  <div className="flex min-w-0 items-start gap-x-3">
                    <div className="mt-0.5 flex size-7 flex-shrink-0 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
                      <Archive className="size-3.5 text-ui-fg-subtle" />
                    </div>
                    <Text size="small" leading="compact" weight="plus" className="break-all">
                      {file.path}
                    </Text>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <FileStatusIcon
                      className={
                        isCaptured
                          ? "size-4 text-ui-fg-success"
                          : "size-4 text-ui-fg-warning"
                      }
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
    <div>
      <div className="flex flex-col gap-y-3 px-6 py-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-x-3">
          <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
            <Database className="size-4 text-ui-fg-subtle" />
          </div>

          <div className="flex min-w-0 flex-col gap-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Text size="small" leading="compact" weight="plus">
                {point.name || "Untitled snapshot record"}
              </Text>
              <Badge color="blue">Snapshot</Badge>
            </div>

            {(point.description || point.business_context) && (
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                {point.description || point.business_context}
              </Text>
            )}

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

              {typeof point.captured_files_count === "number" && (
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  {point.captured_files_count} captured
                </Text>
              )}

              {typeof point.missing_files_count === "number" && (
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  {point.missing_files_count} missing
                </Text>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-y-2 md:items-end">
          {point.hash && (
            <Text
              size="small"
              leading="compact"
              className="break-all text-ui-fg-subtle md:max-w-xs md:text-right"
            >
              {point.hash}
            </Text>
          )}

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
}: RestoreTimelineProps) => {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)

  if (loading && points.length === 0) {
    return <LoadingState />
  }

  if (points.length === 0) {
    return <EmptyState />
  }

  return (
    <Container className="overflow-hidden p-0">
      <div className="border-b border-ui-border-base px-6 py-4">
        <Heading level="h2">Snapshot Records</Heading>
        <Text size="small" leading="compact" className="mt-1 text-ui-fg-subtle">
          Filesystem-backed snapshots created from selected workspace files.
        </Text>
      </div>

      <div className="divide-y divide-ui-border-base">
        {points.map((point) => (
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
