// ============================================================
// COLOR TOKENS - Medusa semantic class tokens only
// No hex, rgb, rgba, or hardcoded palette values.
// ============================================================

export type SemanticColorKey = "emerald" | "amber" | "rose" | "indigo" | "neutral"

export type SemanticColorToken = {
  light: string
  default: string
  dark: string
  text: string
  bg: string
  border: string
  badgeColor: "grey" | "green" | "orange" | "red" | "blue"
}

const baseToken = {
  light: "bg-ui-bg-subtle",
  default: "bg-ui-bg-base",
  dark: "bg-ui-bg-base",
  text: "text-ui-fg-base",
  bg: "bg-ui-bg-subtle",
  border: "border-ui-border-base",
} as const

export const colors = {
  semantic: {
    emerald: {
      ...baseToken,
      badgeColor: "green",
    },
    amber: {
      ...baseToken,
      badgeColor: "orange",
    },
    rose: {
      ...baseToken,
      text: "text-ui-fg-error",
      badgeColor: "red",
    },
    indigo: {
      ...baseToken,
      badgeColor: "blue",
    },
    neutral: {
      ...baseToken,
      badgeColor: "grey",
    },
    success: {
      ...baseToken,
      badgeColor: "green",
    },
    warning: {
      ...baseToken,
      badgeColor: "orange",
    },
    danger: {
      ...baseToken,
      text: "text-ui-fg-error",
      badgeColor: "red",
    },
    info: {
      ...baseToken,
      badgeColor: "blue",
    },
  },
  neutral: {
    white: "bg-ui-bg-base",
    gray: {
      50: "bg-ui-bg-subtle",
      100: "bg-ui-bg-subtle",
      200: "bg-ui-bg-disabled",
      300: "border-ui-border-base",
      400: "text-ui-fg-subtle",
      500: "text-ui-fg-muted",
      600: "text-ui-fg-base",
      700: "text-ui-fg-base",
      800: "text-ui-fg-base",
      900: "text-ui-fg-base",
      950: "text-ui-fg-base",
    },
  },
  chart: {
    safe: "bg-ui-bg-subtle",
    danger: "bg-ui-bg-subtle",
  },
} as const
