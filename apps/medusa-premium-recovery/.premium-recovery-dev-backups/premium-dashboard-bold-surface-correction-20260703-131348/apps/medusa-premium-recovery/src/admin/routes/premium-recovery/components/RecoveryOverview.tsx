import { useMemo } from "react"

import {
  resolvePRStatus,
  toneClasses,
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

    return [
      {
        name: "Status",
        tone: descriptor.tone,
        badge: statusKnown ? descriptor.label : "Unknown",
        detail: statusKnown ? descriptor.description : "Status not resolved",
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
    <Container className="w-full overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base p-3 shadow-elevation-card-rest">
      <div className="grid gap-3 xl:grid-cols-[minmax(120px,0.16fr)_minmax(0,1fr)] xl:items-stretch">
        <div className="flex min-w-0 flex-col justify-center text-start">
          <Text size="small" leading="compact" weight="plus" className="text-ui-fg-base">
            Signals
          </Text>
          <Text size="small" leading="compact" className="mt-0.5 text-ui-fg-muted">
            Git and local state.
          </Text>
        </div>

        {!hasKnownSignal ? (
          <Text size="small" leading="compact" className="text-ui-fg-muted">
            Overview unavailable until system status resolves.
          </Text>
        ) : null}

        <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {signals.map((signal, index) => {
            const toneClass = toneClasses[signal.tone]
            const dotClass = toneDots[signal.tone]

            return (
              <div
                key={signal.name}
                className={clsx(
                  "group flex min-h-[64px] min-w-0 flex-col justify-between gap-2 rounded-lg border bg-ui-bg-component px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition duration-150 hover:border-ui-border-strong hover:bg-ui-bg-component-hover",
                  index === 0 ? "xl:col-span-2" : "",
                  toneClass.surface
                )}
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
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
                      className="whitespace-nowrap text-ui-fg-base"
                    >
                      {signal.name}
                    </Text>
                  </div>

                  <span
                    className={clsx(
                      "inline-flex h-5 shrink-0 items-center rounded-md px-2 text-[10px] font-medium leading-none ring-1",
                      toneClass.badge,
                      signal.isKnown ? "" : "opacity-70"
                    )}
                  >
                    <span className="whitespace-nowrap">{signal.badge}</span>
                  </span>
                </div>

                <Text
                  size="small"
                  leading="compact"
                  className={clsx(
                    "min-w-0 whitespace-normal break-words text-xs leading-4",
                    signal.isKnown ? dotClass.text : "text-ui-fg-muted"
                  )}
                >
                  {signal.detail}
                </Text>
              </div>
            )
          })}
        </div>
      </div>
    </Container>
  )
}

export default RecoveryOverview
