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
        "group relative flex h-full min-h-[156px] flex-col overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base p-3 shadow-elevation-card-rest transition duration-200 hover:-translate-y-px hover:border-ui-border-strong hover:bg-ui-bg-base-hover hover:shadow-elevation-card-hover",
        identityClass.surface,
        className
      )}
    >
      <div className={clsx("absolute inset-x-0 bottom-0 h-1", identityClass.accent[tone])} />

      <div className="relative flex h-full flex-col text-start">
        <header className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={clsx(
                "flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg shadow-md ring-1 ring-white/20 transition duration-200 group-hover:scale-[1.02]",
                identityClass.tile[tone],
                identityClass.tileShadow[tone]
              )}
            >
              <Icon className="size-[18px]" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <Text className="whitespace-normal break-words text-[10.5px] font-semibold uppercase leading-4 tracking-[0.085em] text-ui-fg-muted">
                {title}
              </Text>
            </div>
          </div>

          {badge ? (
            <div className="shrink-0 pt-1">
              <Badge
                size="small"
                className={clsx(
                  "inline-flex h-5 max-w-full shrink-0 items-center rounded-md px-2 text-[10px] font-medium leading-none ring-1",
                  toneClass.badge
                )}
              >
                <span className="truncate">{badge}</span>
              </Badge>
            </div>
          ) : null}
        </header>

        <div className="mt-3 min-w-0">
          <div className="whitespace-normal break-words text-[1.28rem] font-semibold leading-[1.13] tracking-tight text-ui-fg-base sm:text-[1.38rem]">
            {value}
          </div>
          {description ? (
            <Text className="mt-1.5 text-[13px] leading-[18px] text-ui-fg-subtle">
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
