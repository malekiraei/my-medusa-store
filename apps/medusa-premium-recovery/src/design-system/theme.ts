export type Tone = "neutral" | "success" | "warning" | "danger" | "info"
export type ToneState = "critical" | "moderate" | "subtle" | "info"
export type ToneColor = "neutral" | "emerald" | "amber" | "rose" | "indigo"

export type BadgeColor = "grey" | "green" | "orange" | "red" | "blue"

export type ToneConfig = {
  color: ToneColor
  text: string
  mutedText: string
  bg: string
  border: string
  icon: string
  badgeColor: BadgeColor
}

export const toneClassMap: Record<Tone, ToneConfig> = {
  neutral: {
    color: "neutral",
    text: "text-ui-fg-base",
    mutedText: "text-ui-fg-muted",
    bg: "bg-ui-bg-subtle",
    border: "border-ui-border-base",
    icon: "text-ui-fg-subtle",
    badgeColor: "grey",
  },
  success: {
    color: "emerald",
    text: "text-ui-fg-base",
    mutedText: "text-ui-fg-muted",
    bg: "bg-ui-bg-subtle",
    border: "border-ui-border-base",
    icon: "text-ui-fg-subtle",
    badgeColor: "green",
  },
  warning: {
    color: "amber",
    text: "text-ui-fg-base",
    mutedText: "text-ui-fg-muted",
    bg: "bg-ui-bg-subtle",
    border: "border-ui-border-base",
    icon: "text-ui-fg-subtle",
    badgeColor: "orange",
  },
  danger: {
    color: "rose",
    text: "text-ui-fg-base",
    mutedText: "text-ui-fg-muted",
    bg: "bg-ui-bg-subtle",
    border: "border-ui-border-base",
    icon: "text-ui-fg-error",
    badgeColor: "red",
  },
  info: {
    color: "indigo",
    text: "text-ui-fg-base",
    mutedText: "text-ui-fg-muted",
    bg: "bg-ui-bg-subtle",
    border: "border-ui-border-base",
    icon: "text-ui-fg-subtle",
    badgeColor: "blue",
  },
}

export const resolveTone = (state: ToneState): Tone => {
  const toneMap: Record<ToneState, Tone> = {
    critical: "danger",
    moderate: "warning",
    subtle: "success",
    info: "info",
  }

  return toneMap[state] ?? "neutral"
}

export const getToneConfig = (state: ToneState): ToneConfig => {
  return toneClassMap[resolveTone(state)]
}

export const theme = toneClassMap