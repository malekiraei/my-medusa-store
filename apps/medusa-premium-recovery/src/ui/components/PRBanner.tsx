import React from "react"
import { Badge, Button, Container, Heading, Text } from "../vendor"

export type PRBannerTone = "success" | "warning" | "error" | "neutral"

type PRBannerProps = {
  title: string
  description?: string
  badge?: string
  tone?: PRBannerTone
  icon?: React.ReactNode
  actionLabel?: string
  actionVariant?: "primary" | "secondary" | "transparent"
  loading?: boolean
  onAction?: () => void
}

const badgeColorMap: Record<PRBannerTone, "green" | "orange" | "red" | "grey"> = {
  success: "green",
  warning: "orange",
  error: "red",
  neutral: "grey",
}

export function PRBanner({
  title,
  description,
  badge,
  tone = "neutral",
  icon,
  actionLabel,
  actionVariant = "secondary",
  loading = false,
  onAction,
}: PRBannerProps) {
  return (
    <Container className="p-0">
      <div className="flex flex-col gap-y-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-x-3">
          {icon ? (
            <div className="flex items-center justify-center rounded-full border border-ui-border-base bg-ui-bg-subtle p-2 shadow-elevation-card">
              {icon}
            </div>
          ) : null}

          <div className="flex flex-col gap-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Heading level="h3">{title}</Heading>

              {badge ? (
                <Badge color={badgeColorMap[tone]}>{badge}</Badge>
              ) : null}
            </div>

            {description ? (
              <Text size="small" className="text-ui-fg-muted">
                {description}
              </Text>
            ) : null}
          </div>
        </div>

        {onAction && actionLabel ? (
          <Button
            type="button"
            variant={actionVariant}
            onClick={onAction}
            disabled={loading}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </Container>
  )
}
