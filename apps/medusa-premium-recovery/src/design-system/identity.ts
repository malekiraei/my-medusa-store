// ============================================================
// IDENTITY CONTRACT - Medusa aligned
// Keeps product language modular without defining custom visuals.
// ============================================================

export type EmotionLevel = "subtle" | "moderate" | "critical"
export type EmotionColor = "emerald" | "amber" | "rose"
export type EmotionIcon = "shield" | "alert"

export type EmotionConfig = {
  color: EmotionColor
  badgeColor: "green" | "orange" | "red"
  icon: EmotionIcon
}

export const lightMood = {
  surface: "bg-ui-bg-base",
  subtleSurface: "bg-ui-bg-subtle",
  hoverSurface: "bg-ui-bg-hover",
  disabledSurface: "bg-ui-bg-disabled",
} as const

export const motionFeel = {
  style: "medusa-native",
  transition: "transition-colors",
} as const

export const emotionalScale: {
  levels: readonly EmotionLevel[]
  mapping: Record<EmotionLevel, EmotionConfig>
} = {
  levels: ["subtle", "moderate", "critical"] as const,
  mapping: {
    subtle: {
      color: "emerald",
      badgeColor: "green",
      icon: "shield",
    },
    moderate: {
      color: "amber",
      badgeColor: "orange",
      icon: "shield",
    },
    critical: {
      color: "rose",
      badgeColor: "red",
      icon: "alert",
    },
  },
}

export const identity = {
  light: lightMood,
  motion: motionFeel,
  emotion: emotionalScale,
}
