import { useState, type ReactNode } from "react"

import { identityClasses, resolvePRStatus, type PRMetricIdentity, type PRMetricTone, type PRSystemStatus } from "../../../../ui/adapters/status"
import { PRMetricCard, PRMetricGrid, type PRMetricIcon, type PRMetricTrendPoint } from "../../../../ui/components/metric"
import {
  Button,
  Container,
  DatabaseBackup,
  FileClock,
  Gauge,
  Heading,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Text,
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
      badge: descriptor.tone === "success" ? "Safe" : descriptor.tone,
      tone: descriptor.tone,
      identity: "system",
      icon: ShieldCheck,
    },
    {
      title: "Changed Files",
      value: hasChangedFiles ? changedFiles : "Unknown",
      description: hasChangedFiles
        ? hasChanges
          ? "Files are ready to be captured in a file-backed snapshot."
          : "No changed files reported by the snapshot contract."
        : "Changed file data is not available.",
      badge: hasChangedFiles ? hasChanges ? "Review" : "Clean" : "Unknown",
      tone: hasChangedFiles ? hasChanges ? "warning" : "success" : "neutral",
      identity: "changes",
      icon: FileClock,
      trendVariant: "line",
    },
    {
      title: "Snapshot Records",
      value: hasRestorePoints ? restorePoints : "Unknown",
      description: hasRestorePoints
        ? restorePoints > 0
          ? "File-backed snapshot records are stored locally."
          : "No snapshot records exist yet."
        : "Snapshot record data is not available.",
      badge: hasRestorePoints ? restorePoints > 0 ? "Captured" : "Empty" : "Unknown",
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
      badge: hasBundles ? bundles > 0 ? "Tracked" : "None" : "Unknown",
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
    <div className={clsx("space-y-7", className)}>
      <Container className="relative overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-base p-0 shadow-[0_12px_36px_-28px_rgba(15,23,42,0.35)]">
        <div className="absolute inset-x-0 top-0 h-px bg-white/70 dark:bg-white/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-bg-subtle/70 via-transparent to-transparent" />
        <div className={clsx("absolute inset-y-4 start-0 w-1 rounded-e-full opacity-70", systemIdentityClass.accent[descriptor.tone])} />

        <div className="relative grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_1px_minmax(220px,320px)] lg:items-center lg:gap-6 lg:p-6">
          <div className="flex min-w-0 flex-col items-start gap-3 text-start">
            <div className={clsx("relative flex size-[4.25rem] shrink-0 items-center justify-center rounded-2xl bg-ui-bg-subtle text-ui-fg-base shadow-lg ring-1 ring-ui-border-base sm:size-[4.5rem]", systemIdentityClass.tileShadow[descriptor.tone])}>
              <div
                className={clsx(
                  "absolute -inset-1 rounded-2xl bg-gradient-to-br opacity-35 blur-sm",
                  identityClasses.neutral.glow[descriptor.tone]
                )}
              />
              <div
                className={clsx(
                  "absolute -inset-1.5 rounded-2xl bg-gradient-to-br opacity-95 blur-md",
                  identityClasses.neutral.glow[descriptor.tone]
                )}
              />
              <Sparkles className="relative size-7 sm:size-8" strokeWidth={2.1} />
            </div>

            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-ui-border-base bg-ui-bg-subtle px-2.5 py-1 text-[11px] font-medium text-ui-fg-muted">
                <Gauge className="size-3.5" strokeWidth={2.1} />
                Snapshot Control Center
              </div>

              <Heading level="h1" className="text-xl font-bold tracking-tight text-ui-fg-base sm:text-2xl">
                Snapshot Dashboard
              </Heading>

              <Text className="mt-2 max-w-2xl text-sm leading-6 text-ui-fg-muted">
                Monitor Git status, detect file changes, and capture selected files into local snapshot records.
              </Text>
            </div>
          </div>

          <div className="hidden h-full min-h-28 w-px bg-ui-border-base/30 lg:block" />

          <div className="flex w-full flex-col gap-3 lg:justify-self-end">
            <div className="flex items-start gap-3 text-start">
              <div className={clsx("flex size-10 shrink-0 items-center justify-center rounded-xl", systemIdentityClass.tile[descriptor.tone])}>
                <StatusIcon className="size-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <Text className="truncate text-sm font-semibold text-ui-fg-base">{resolvedStatusLabel}</Text>
                <Text className="mt-1 line-clamp-2 text-xs leading-5 text-ui-fg-muted">
                  {lastSyncText}
                </Text>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-40 lg:w-full">
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

              <Button size="small" onClick={onCreateSnapshot} className="h-9 w-full justify-center shadow-elevation-card-rest">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4" strokeWidth={2.1} />
                  {createSnapshotLabel}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {overview ? overview : null}

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
