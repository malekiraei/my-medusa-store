import { useState, type ReactNode } from "react"

import { identityClasses, resolvePRStatus, type PRMetricIdentity, type PRMetricTone, type PRSystemStatus } from "../../../../ui/adapters/status"
import { PRMetricCard, PRMetricGrid, type PRMetricIcon, type PRMetricTrendPoint } from "../../../../ui/components/metric"
import {
  Button,
  Container,
  Database,
  DatabaseBackup,
  Area,
  AreaChart,
  FileClock,
  Heading,
  Line,
  PackageSearch,
  RefreshCw,
  ResponsiveContainer,
  ShieldCheck,
  Text,
  Tooltip,
  XAxis,
  clsx,
} from "../../../../ui/vendor"

export type DashboardMetric = {
  title: string
  value: ReactNode
  description?: ReactNode
  badge?: ReactNode
  footer?: ReactNode
  timestamp?: ReactNode
  action?: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
  tone?: PRMetricTone
  identity?: PRMetricIdentity
  icon?: PRMetricIcon
  trend?: PRMetricTrendPoint[]
  trendVariant?: "area" | "line"
  progress?: number
}

export type DashboardCardsProps = {
  status?: PRSystemStatus
  statusLabel?: string
  statusDescription?: string
  lastSyncText?: ReactNode
  changedFiles?: number | null
  restorePoints?: number | null
  bundles?: number | null
  onCreateSnapshot?: () => void
  onManualSync?: () => void | Promise<void>
  onQuickCheck?: () => void | Promise<void>
  createSnapshotLabel?: ReactNode
  manualSyncLabel?: ReactNode
  quickCheckLabel?: ReactNode
  metrics?: DashboardMetric[]
  overview?: ReactNode
  className?: string
}

const snapshotActivityPreviewData = [
  { period: "Jun 4", snapshots: 0 },
  { period: "Jun 11", snapshots: 1 },
  { period: "Jun 18", snapshots: 2 },
  { period: "Jun 25", snapshots: 1 },
]

export const DashboardCards = ({
  status = "unknown",
  statusLabel,
  statusDescription,
  lastSyncText = "Status will update after the next check",
  changedFiles,
  restorePoints,
  bundles,
  onCreateSnapshot,
  onManualSync,
  onQuickCheck,
  createSnapshotLabel = "Create Snapshot",
  manualSyncLabel = "Manual Sync",
  quickCheckLabel = "Quick Check",
  metrics,
  overview,
  className,
}: DashboardCardsProps) => {
  const [isQuickCheckPending, setIsQuickCheckPending] = useState(false)
  const descriptor = resolvePRStatus(status)
  const systemIdentityClass = identityClasses.system
  const StatusIcon = descriptor.icon
  const resolvedStatusLabel = statusLabel ?? descriptor.label
  const resolvedStatusDescription = statusDescription ?? descriptor.description
  const hasChangedFiles = typeof changedFiles === "number"
  const hasChanges = hasChangedFiles && changedFiles > 0
  const hasRestorePoints = typeof restorePoints === "number"
  const hasBundles = typeof bundles === "number"

  const defaultMetrics: DashboardMetric[] = [
    {
      title: "System Status",
      value: resolvedStatusLabel,
      description: resolvedStatusDescription,
      tone: descriptor.tone,
      identity: "system",
      icon: ShieldCheck,
    },
    {
      title: "Changed Files",
      value: hasChangedFiles ? changedFiles : "Unknown",
      description: hasChangedFiles
        ? hasChanges
          ? "Files can be selected for a file-backed snapshot."
          : "No changed files reported by the snapshot contract."
        : "Changed file data is not available.",
      tone: hasChangedFiles ? hasChanges ? "warning" : "success" : "neutral",
      identity: "changes",
      icon: FileClock,
      trendVariant: "line",
    },
    {
      title: "Records",
      value: hasRestorePoints ? restorePoints : "Unknown",
      description: hasRestorePoints
        ? restorePoints > 0
          ? "File-backed records are stored locally."
          : "No records exist yet."
        : "Record data is not available.",
      tone: hasRestorePoints ? restorePoints > 0 ? "info" : "neutral" : "neutral",
      identity: "restore",
      icon: DatabaseBackup,
    },
    {
      title: "Bundles",
      value: hasBundles ? bundles : "Unknown",
      description: hasBundles
        ? bundles > 0
          ? "Bundle records are tracked."
          : "No bundle record has been created yet."
        : "Bundle data is not available.",
      tone: hasBundles ? bundles > 0 ? "info" : "neutral" : "neutral",
      identity: "bundles",
      icon: PackageSearch,
    },
  ]

  const visibleMetrics = metrics?.length ? metrics : defaultMetrics
  const quickCheckAction = onManualSync ?? onQuickCheck
  const quickCheckContent = onManualSync ? manualSyncLabel : quickCheckLabel

  const handleQuickCheck = async () => {
    if (!quickCheckAction || isQuickCheckPending) {
      return
    }

    try {
      const result = quickCheckAction()

      if (result && typeof (result as Promise<void>).then === "function") {
        setIsQuickCheckPending(true)
        await result
      }
    } finally {
      setIsQuickCheckPending(false)
    }
  }

  return (
    <div className={clsx("space-y-3", className)}>
      <Container className="relative overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base p-0 shadow-elevation-card-rest">
        <div className="absolute inset-x-0 top-0 h-px bg-white/80 dark:bg-white/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-bg-subtle/70 via-ui-bg-base to-ui-bg-base" />
        <div className={clsx("absolute inset-x-5 bottom-0 h-1 rounded-t-full", systemIdentityClass.accent[descriptor.tone])} />

        <div className="relative grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(250px,300px)] lg:items-center">
          <div className="flex min-w-0 items-center gap-4 text-start">
            <div className={clsx("flex size-12 shrink-0 items-center justify-center rounded-xl bg-ui-bg-subtle text-ui-fg-base shadow-elevation-card-rest ring-1 ring-ui-border-base", systemIdentityClass.tileShadow[descriptor.tone])}>
              <Database className="size-6" strokeWidth={2.1} />
            </div>

            <div className="min-w-0">
              <div className="mb-1.5 inline-flex items-center gap-2 rounded-md border border-ui-border-base bg-ui-bg-subtle px-2 py-1 text-[11px] font-medium text-ui-fg-muted">
                <FileClock className="size-3.5" strokeWidth={2.1} />
                Snapshot workspace
              </div>

              <Heading level="h1" className="text-xl font-semibold tracking-tight text-ui-fg-base sm:text-2xl">
                Snapshot Dashboard
              </Heading>

              <Text className="mt-1 max-w-2xl text-sm leading-6 text-ui-fg-muted">
                Track Git changes, capture selected workspace files, and review file-backed snapshot records.
              </Text>
            </div>
          </div>

          <div className="rounded-xl border border-ui-border-base bg-ui-bg-component/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            <div className="mb-3 flex items-start gap-3 text-start">
              <div className={clsx("flex size-10 shrink-0 items-center justify-center rounded-lg shadow-sm", systemIdentityClass.tile[descriptor.tone])}>
                <StatusIcon className="size-4" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <Text className="text-sm font-semibold leading-5 text-ui-fg-base">{resolvedStatusLabel}</Text>
                <Text className="mt-0.5 text-xs leading-5 text-ui-fg-muted">
                  {lastSyncText}
                </Text>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-2">
              <Button
                size="small"
                variant="secondary"
                onClick={handleQuickCheck}
                disabled={!quickCheckAction || isQuickCheckPending}
                className="h-9 w-full justify-center"
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCw
                    className={clsx("size-4", isQuickCheckPending ? "animate-spin" : "")}
                    strokeWidth={2.1}
                  />
                  {quickCheckContent}
                </span>
              </Button>

              <Button size="small" onClick={onCreateSnapshot} className="h-9 w-full justify-center">
                <span className="inline-flex items-center gap-2">
                  <FileClock className="size-4" strokeWidth={2.1} />
                  {createSnapshotLabel}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {overview ? overview : null}

      <Container className="overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base p-0 shadow-elevation-card-rest">
        <div className="border-b border-ui-border-base px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 text-start">
              <div className="flex flex-wrap items-center gap-2">
              <Text size="small" leading="compact" weight="plus" className="text-ui-fg-base">
                Activity
              </Text>
              <span className="inline-flex items-center rounded-md border border-ui-border-base bg-ui-bg-subtle px-2 py-1 text-[11px] font-medium leading-none text-ui-fg-muted">
                Preview data
              </span>
              </div>
              <Text size="small" leading="compact" className="mt-1 text-ui-fg-muted">
                Preview layout for future real activity trends.
              </Text>
            </div>
            <Text size="small" leading="compact" className="shrink-0 text-ui-fg-muted">
              Last 30 days
            </Text>
          </div>
        </div>

        <div className="p-4">

          <div
            aria-label="Activity preview chart for the last 30 days"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            className="relative h-40 select-none overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle/25 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] outline-none focus:outline-none focus-visible:outline-none [&_*:focus-visible]:outline-none [&_*:focus]:outline-none [&_*]:outline-none [&_g]:outline-none [&_path]:outline-none [&_svg]:select-none [&_svg]:outline-none [&_.recharts-active-dot]:outline-none [&_.recharts-active-shape]:outline-none [&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-tooltip-cursor]:hidden [&_.recharts-wrapper]:outline-none"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 bottom-10 top-6 rounded-md">
              <div className="absolute inset-x-0 top-1/4 h-px bg-ui-border-base/50" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-ui-border-base/45" />
              <div className="absolute inset-x-0 top-3/4 h-px bg-ui-border-base/40" />
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                accessibilityLayer={false}
                className="outline-none focus:outline-none focus-visible:outline-none"
                data={snapshotActivityPreviewData}
                margin={{ top: 16, right: 16, bottom: 2, left: 8 }}
              >
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickMargin={8}
                  tick={{ fill: "currentColor", fontSize: 10 }}
                  className="text-ui-fg-muted"
                />
                <Tooltip
                  cursor={false}
                  wrapperStyle={{ outline: "none" }}
                  separator=" "
                  labelStyle={{ fontSize: 11 }}
                  itemStyle={{ fontSize: 11 }}
                />
                <Area
                  type="monotone"
                  dataKey="snapshots"
                  stroke="none"
                  fill="currentColor"
                  fillOpacity={0.1}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                  className="text-ui-fg-muted"
                />
                <Line
                  type="monotone"
                  dataKey="snapshots"
                  name="Preview data"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  dot={{ r: 3, strokeWidth: 1.5, fill: "currentColor" }}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  isAnimationActive={false}
                  className="text-ui-fg-muted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Container>

      <PRMetricGrid>
        {visibleMetrics.map((metric) => {
          const Icon = metric.icon ?? ShieldCheck

          return (
            <PRMetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              description={metric.description}
              badge={metric.badge}
              footer={metric.footer}
              timestamp={metric.timestamp}
              action={metric.action}
              actionLabel={metric.actionLabel}
              onAction={metric.onAction}
              tone={metric.tone}
              identity={metric.identity}
              icon={Icon}
              trend={metric.trend}
              trendVariant={metric.trendVariant}
              progress={metric.progress}
            />
          )
        })}
      </PRMetricGrid>
    </div>
  )
}

export default DashboardCards
