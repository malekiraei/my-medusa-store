import { useMemo } from "react"

import {
  resolvePRStatus,
  type PRMetricTone,
  type PRSystemStatus,
} from "../../../../ui/adapters/status"
import { Container, Text, clsx } from "../../../../ui/vendor"

type RecoveryOverviewProps = {
  status?: PRSystemStatus
  changedFiles?: number | null
  restorePoints?: number | null
  bundles?: number | null
  gitAvailable?: boolean
  gitClean?: boolean
}

type OverviewSignal = {
  name: string
  tone: PRMetricTone
  badge: string
  detail: string
  isKnown: boolean
}

const toneDots: Record<PRMetricTone, {
  dot: string
  text: string
}> = {
  success: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
  },
  error: {
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
  },
  info: {
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-300",
  },
  neutral: {
    dot: "bg-slate-400",
    text: "text-ui-fg-muted",
  },
}

const getGitSegment = (
  gitAvailable?: boolean,
  gitClean?: boolean
): OverviewSignal => {
  if (typeof gitAvailable !== "boolean") {
    return {
      name: "Git State",
      tone: "neutral",
      badge: "Unknown",
      detail: "Unknown",
      isKnown: false,
    }
  }

  if (!gitAvailable) {
    return {
      name: "Git State",
      tone: "error",
      badge: "Unavailable",
      detail: "Unavailable",
      isKnown: true,
    }
  }

  if (typeof gitClean !== "boolean") {
    return {
      name: "Git State",
      tone: "neutral",
      badge: "Unknown",
      detail: "Unknown",
      isKnown: false,
    }
  }

  return {
    name: "Git State",
    tone: gitClean ? "success" : "warning",
    badge: gitClean ? "Clean" : "Changed",
    detail: gitClean ? "Clean" : "Changes detected",
    isKnown: true,
  }
}

const getCountSegment = (
  name: string,
  count: number | null | undefined,
  emptyLabel: string,
  emptyTone: PRMetricTone,
  emptyBadge: string,
  activeLabel: (count: number) => string,
  activeTone: PRMetricTone,
  activeBadge: string
): OverviewSignal => {
  if (typeof count !== "number") {
    return {
      name,
      tone: "neutral",
      badge: "Unknown",
      detail: "Unknown",
      isKnown: false,
    }
  }

  return {
    name,
    tone: count > 0 ? activeTone : emptyTone,
    badge: count > 0 ? activeBadge : emptyBadge,
    detail: count > 0 ? activeLabel(count) : emptyLabel,
    isKnown: true,
  }
}

export const RecoveryOverview = ({
  status = "unknown",
  changedFiles,
  restorePoints,
  bundles,
  gitAvailable,
  gitClean,
}: RecoveryOverviewProps) => {
  const descriptor = resolvePRStatus(status)

  const signals = useMemo<OverviewSignal[]>(() => {
    const statusKnown = String(status).toLowerCase() !== "unknown"
    const statusDetail = statusKnown && descriptor.description === "No current file-backed snapshot baseline is available."
      ? "No file-backed baseline."
      : descriptor.description

    return [
      {
        name: "Status",
        tone: descriptor.tone,
        badge: statusKnown ? descriptor.label : "Unknown",
        detail: statusKnown ? statusDetail : "Status not resolved",
        isKnown: statusKnown,
      },
      getGitSegment(gitAvailable, gitClean),
      getCountSegment(
        "Changed Files",
        changedFiles,
        "No changed files",
        "success",
        "Clean",
        (count) => `${count} changed`,
        "warning",
        "Review"
      ),
      getCountSegment(
        "Records",
        restorePoints,
        "None captured",
        "neutral",
        "Empty",
        (count) => `${count} captured`,
        "info",
        "Captured"
      ),
      getCountSegment(
        "Bundles",
        bundles,
        "None tracked",
        "neutral",
        "None",
        (count) => `${count} tracked`,
        "info",
        "Tracked"
      ),
    ]
  }, [bundles, changedFiles, descriptor.label, descriptor.tone, gitAvailable, gitClean, restorePoints, status])

  const hasKnownSignal = signals.some((signal) => signal.isKnown)

  return (
    <Container className="relative flex h-full min-h-[252px] w-full flex-col overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base p-0 shadow-elevation-card-rest">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ui-bg-subtle/35 via-ui-bg-base to-ui-bg-base" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70 dark:bg-white/10" />
      {!hasKnownSignal ? (
        <div className="relative flex flex-1 items-center px-4 py-5">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Overview unavailable until system status resolves.
          </Text>
        </div>
      ) : null}

      {hasKnownSignal ? (
        <div className="relative flex flex-1 flex-col justify-center px-3 py-3">
          {signals.map((signal, index) => {
            const dotClass = toneDots[signal.tone]

            return (
              <div
                key={signal.name}
                className={clsx(
                  "grid min-h-[32px] grid-cols-[auto_minmax(24px,1fr)_auto] items-center gap-2 rounded-md px-1.5 py-1 transition duration-150 hover:bg-ui-bg-subtle/60",
                  index === 0 ? "min-h-[34px]" : ""
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={clsx(
                      "size-2 shrink-0 rounded-full",
                      dotClass.dot,
                      signal.isKnown ? "" : "opacity-45"
                    )}
                  />
                  <Text
                    size="small"
                    leading="compact"
                    weight="plus"
                    className="min-w-0 whitespace-nowrap text-ui-fg-base"
                  >
                    {signal.name}
                  </Text>
                </div>

                <span
                  aria-hidden="true"
                  className="mb-0.5 h-px min-w-4 flex-1 border-b border-dotted border-ui-border-base/70"
                />

                <Text
                  size="small"
                  leading="compact"
                  className={clsx(
                    "max-w-[150px] shrink-0 truncate text-end text-xs leading-4 xl:max-w-[180px]",
                    signal.isKnown ? dotClass.text : "text-ui-fg-muted"
                  )}
                >
                  {signal.detail}
                </Text>
              </div>
            )
          })}
        </div>
      ) : null}

      <div className="relative mt-auto px-4 pb-3 pt-1 text-start">
        <Text size="small" leading="compact" className="text-xs text-ui-fg-muted">
          Signals summarize the current Git state and local records.
        </Text>
      </div>
    </Container>
  )
}

export default RecoveryOverview
