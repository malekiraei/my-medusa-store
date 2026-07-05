// ============================================================
// DESIGN LOCK - Medusa semantic tokens only
// Keeps a stable modular contract for the plugin UI.
// ============================================================

export const design = {
  color: {
    text: {
      base: "text-ui-fg-base",
      muted: "text-ui-fg-muted",
      subtle: "text-ui-fg-subtle",
      error: "text-ui-fg-error",
    },
    background: {
      base: "bg-ui-bg-base",
      subtle: "bg-ui-bg-subtle",
      hover: "bg-ui-bg-hover",
      disabled: "bg-ui-bg-disabled",
    },
    border: {
      base: "border-ui-border-base",
    },
  },
  shadow: {
    card: "shadow-elevation-card",
    flyout: "shadow-elevation-flyout",
    modal: "shadow-elevation-modal",
    tooltip: "shadow-elevation-tooltip",
    soft: "shadow-elevation-card",
    hover: "shadow-elevation-card",
  },
  layout: {
    container: {
      panel: "bg-ui-bg-base border border-ui-border-base shadow-elevation-card",
      subtle: "bg-ui-bg-subtle border border-ui-border-base",
    },
    card: "bg-ui-bg-base border border-ui-border-base shadow-elevation-card",
    section: "bg-ui-bg-base border border-ui-border-base",
    divider: "divide-y divide-ui-border-base",
  },
  spacing: {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-6",
    insetSm: "p-2",
    insetMd: "p-4",
    insetLg: "p-6",
  },
  radius: {
    base: "rounded-md",
    full: "rounded-full",
  },
  motion: {
    transition: "transition-colors",
  },
} as const

export default design
