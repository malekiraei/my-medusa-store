import React from "react"
import {
  Card,
  Group,
  MantineBadge,
  MantineText,
  Progress,
  Stack,
  ThemeIcon,
} from "../vendor"

export type PRMetricTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"

type PRMetricCardProps = {
  title: string
  value: string | number
  description?: string
  badge?: string
  tone?: PRMetricTone
  loading?: boolean
  progress?: number
  icon?: React.ReactNode
}

const toneColorMap: Record<PRMetricTone, string> = {
  success: "teal",
  warning: "orange",
  error: "red",
  info: "blue",
  neutral: "gray",
}

export function PRMetricCard({
  title,
  value,
  description,
  badge,
  tone = "neutral",
  loading = false,
  progress,
  icon,
}: PRMetricCardProps) {
  const color = toneColorMap[tone]
  const safeProgress =
    typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : 0

  return (
    <Card
      withBorder
      radius="lg"
      shadow="sm"
      p="lg"
      className="relative min-h-[150px] overflow-visible bg-ui-bg-base pt-14 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevation-card-hover"
    >
      <ThemeIcon
        size={72}
        radius="md"
        color={color}
        variant="filled"
        className="absolute -top-6 start-6 shadow-elevation-card-hover"
      >
        {icon}
      </ThemeIcon>

      <Stack gap="sm" className="text-start">
        <Group justify="space-between" align="flex-start" gap="sm">
          <Stack gap={2}>
            <MantineText size="sm" className="text-ui-fg-muted">
              {title}
            </MantineText>

            <MantineText fw={700} size="xl" className="text-ui-fg-base">
              {loading ? "…" : value}
            </MantineText>
          </Stack>

          {badge ? (
            <MantineBadge color={color} variant="light" radius="md">
              {badge}
            </MantineBadge>
          ) : null}
        </Group>

        {description ? (
          <MantineText size="sm" className="text-ui-fg-subtle">
            {description}
          </MantineText>
        ) : null}

        {progress !== undefined ? (
          <Progress value={safeProgress} color={color} radius="xl" size="xs" />
        ) : null}
      </Stack>
    </Card>
  )
}

export default PRMetricCard