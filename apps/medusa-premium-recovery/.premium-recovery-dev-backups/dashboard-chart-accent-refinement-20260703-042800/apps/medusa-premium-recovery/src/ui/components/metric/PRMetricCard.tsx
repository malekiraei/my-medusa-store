import type { ComponentType, ReactNode } from "react"

import { Badge, Text } from "../../vendor/medusa"
import { clsx } from "../../vendor/mantine"
import { identityClasses, toneClasses, type PRMetricIdentity, type PRMetricTone } from "../../adapters/status"
import { PRMetricTrend, type PRMetricTrendPoint } from "./PRMetricTrend"

export type PRMetricIcon = ComponentType<{ className?: string; strokeWidth?: string | number }>

export type PRMetricCardProps = {
  title: string
  value: ReactNode
  description?: ReactNode
  badge?: ReactNode
  footer?: ReactNode
  timestamp?: ReactNode
  action?: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
  icon: PRMetricIcon
  tone?: PRMetricTone
  identity?: PRMetricIdentity
  trend?: PRMetricTrendPoint[]
  trendVariant?: "area" | "line"
  progress?: number
  className?: string
}

export const PRMetricCard = ({
  title,
  value,
  description,
  badge,
  footer,
  timestamp,
  action,
  actionLabel,
  onAction,
  icon: Icon,
  tone = "neutral",
  identity = "neutral",
  trend,
  trendVariant = "area",
  progress,
  className,
}: PRMetricCardProps) => {
  const toneClass = toneClasses[tone]
  const identityClass = identityClasses[identity]
  const hasTrend = Boolean(trend && trend.length > 1)
  const hasProgress = typeof progress === "number"
  const actionContent = action ?? (
    actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="text-ui-fg-base transition-colors hover:text-ui-fg-interactive"
      >
        {actionLabel}
      </button>
    ) : null
  )
  const normalizedProgress = hasProgress ? Math.max(0, Math.min(100, progress)) : undefined
  const progressWidthClass =
    typeof normalizedProgress !== "number"
      ? undefined
      : normalizedProgress >= 95
        ? "w-full"
        : normalizedProgress >= 80
          ? "w-5/6"
          : normalizedProgress >= 65
            ? "w-2/3"
            : normalizedProgress >= 50
              ? "w-1/2"
              : normalizedProgress >= 35
                ? "w-1/3"
                : normalizedProgress >= 20
                  ? "w-1/4"
                  : normalizedProgress > 0
                    ? "w-1/6"
                    : "w-0"

  return (
    <article
      className={clsx(
        "group relative mt-3 flex h-full min-h-[156px] flex-col overflow-visible rounded-xl border bg-ui-bg-base px-4 pb-4 pt-4 shadow-elevation-card-rest transition duration-200 hover:-translate-y-0.5 hover:shadow-elevation-card-hover",
        identityClass.surface,
        toneClass.surface,
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className={clsx("absolute inset-y-4 start-0 w-1 rounded-e-full opacity-70", identityClass.accent[tone])} />
        <div className={clsx("absolute inset-x-0 top-0 h-16 bg-gradient-to-b opacity-80", identityClass.glow[tone])} />
      </div>

      <div
        className={clsx(
          "absolute start-4 top-0 z-10 flex aspect-square size-12 -translate-y-1/4 items-center justify-center rounded-xl shadow-xl transition duration-200 group-hover:-translate-y-[30%]",
          identityClass.tile[tone],
          identityClass.tileShadow[tone]
        )}
      >
        <Icon className="size-5" strokeWidth={2.25} />
      </div>

      <div className="relative flex h-full flex-col text-start">
        <header className="flex min-h-10 min-w-0 items-start justify-between gap-2 ps-16">
          <div className="min-w-0 pt-0.5">
            <Text className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-ui-fg-muted">
              {title}
            </Text>
          </div>
          {badge ? (
            <Badge
              size="small"
              className={clsx(
                "inline-flex h-5 shrink-0 items-center rounded-lg px-2 text-[10px] font-medium leading-none ring-1",
                toneClass.badge
              )}
            >
              {badge}
            </Badge>
          ) : null}
        </header>

        <div className="mt-2 min-w-0">
          <div className="truncate text-[1.75rem] font-semibold leading-none tracking-tight text-ui-fg-base sm:text-3xl">
            {value}
          </div>
          {description ? (
            <Text className="mt-2 line-clamp-2 text-sm leading-5 text-ui-fg-muted">
              {description}
            </Text>
          ) : null}
        </div>

        {hasTrend || typeof normalizedProgress === "number" ? (
          <div className="mt-4 border-t border-ui-border-base/70 pt-3">
            {hasTrend ? <PRMetricTrend data={trend} tone={tone} variant={trendVariant} height={38} /> : null}

            {typeof normalizedProgress === "number" ? (
              <div className={clsx("h-1.5 overflow-hidden rounded-full bg-ui-bg-subtle", hasTrend ? "mt-3" : "")}>
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    toneClass.progress,
                    progressWidthClass
                  )}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto">
          {(footer || timestamp || actionContent) ? (
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-ui-border-base pt-3 text-[11px] text-ui-fg-muted sm:text-xs">
              <span className="min-w-0 truncate">{footer ?? timestamp}</span>
              {actionContent ? <span className="shrink-0">{actionContent}</span> : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
