// ============================================================
// VISUAL TOKENS - Medusa semantic tokens only
// No custom palette, gradients, hardcoded colors, or dynamic classes.
// ============================================================

export type VisualState =
  | "idle"
  | "analyzing"
  | "selecting"
  | "metadata"
  | "review"
  | "creating"
  | "done"
  | "error"

export type VisualTokens = {
  bg: string
  bgBadge: string
  bgProgress: string
  text: string
  textBadge: string
  border: string
  borderBadge: string
  light: string
  dark: string
  iconColor: string
  stripeColor: string
  progress: string
  buttonPrimary: string
  buttonSecondary: string
  buttonDisabled: string
  stateClass: string
  motionKey: string
  badgeColor: "grey" | "green" | "orange" | "red" | "blue"
}

const shared: Omit<VisualTokens, "motionKey" | "badgeColor"> = {
  bg: "bg-ui-bg-base",
  bgBadge: "bg-ui-bg-subtle",
  bgProgress: "bg-ui-bg-disabled",
  text: "text-ui-fg-base",
  textBadge: "text-ui-fg-muted",
  border: "border-ui-border-base",
  borderBadge: "border-ui-border-base",
  light: "bg-ui-bg-base",
  dark: "bg-ui-bg-subtle",
  iconColor: "text-ui-fg-subtle",
  stripeColor: "bg-ui-bg-disabled",
  progress: "bg-ui-bg-disabled",
  buttonPrimary: "primary",
  buttonSecondary: "secondary",
  buttonDisabled: "secondary",
  stateClass: "bg-ui-bg-base",
}

const badgeMap: Record<VisualState, VisualTokens["badgeColor"]> = {
  idle: "grey",
  analyzing: "blue",
  selecting: "blue",
  metadata: "blue",
  review: "green",
  creating: "blue",
  done: "green",
  error: "red",
}

export const resolveTokens = (state: VisualState): VisualTokens => {
  const safeState = state ?? "idle"
  return {
    ...shared,
    bg: safeState === "analyzing" || safeState === "creating" ? "bg-ui-bg-subtle" : shared.bg,
    text: safeState === "error" ? "text-ui-fg-error" : shared.text,
    textBadge: safeState === "error" ? "text-ui-fg-error" : shared.textBadge,
    iconColor: safeState === "error" ? "text-ui-fg-error" : shared.iconColor,
    motionKey: safeState,
    badgeColor: badgeMap[safeState] ?? "grey",
  }
}
