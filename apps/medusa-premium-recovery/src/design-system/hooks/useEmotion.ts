// ============================================================
// useEmotion - Medusa semantic tokens only
// No dynamic Tailwind classes, hardcoded colors, or custom shadows.
// ============================================================

import { useMemo } from "react"
import { identity, type EmotionLevel } from "../identity"

export type EmotionState = EmotionLevel

export type EmotionStyle = {
  color: string
  bg: string
  text: string
  border: string
  accent: string
  shadow: string
  textClass: string
  bgClass: string
  borderClass: string
  accentClass: string
  badgeClass: string
  actionClass: string
  badge: string
  label: string
  description: string
  badgeColor: "green" | "orange" | "red"
}

type UseEmotionParams = {
  state: EmotionState
  fileCount?: number
}

const labelMap: Record<EmotionState, Pick<EmotionStyle, "badge" | "label">> = {
  subtle: {
    badge: "عادی",
    label: "سیستم پایدار",
  },
  moderate: {
    badge: "توجه",
    label: "بررسی تغییرات",
  },
  critical: {
    badge: "فوری",
    label: "سیستم در معرض خطر",
  },
}

const descriptionFor = (state: EmotionState, fileCount: number) => {
  if (state === "critical") return `${fileCount} فایل بدون محافظت شناسایی شده است`
  if (state === "moderate") return `${fileCount} فایل تغییر کرده است`
  return "همه سیستم‌ها در وضعیت عادی هستند"
}

export const useEmotion = ({ state, fileCount = 0 }: UseEmotionParams): EmotionStyle => {
  return useMemo(() => {
    const safeState: EmotionState = state ?? "subtle"
    const emotion = identity.emotion.mapping[safeState]
    const labels = labelMap[safeState]
    const isCritical = safeState === "critical"

    return {
      color: emotion.color,
      bg: "bg-ui-bg-subtle",
      text: isCritical ? "text-ui-fg-error" : "text-ui-fg-base",
      border: "border-ui-border-base",
      accent: isCritical ? "text-ui-fg-error" : "text-ui-fg-subtle",
      shadow: "shadow-elevation-card",
      textClass: isCritical ? "text-ui-fg-error" : "text-ui-fg-base",
      bgClass: "bg-ui-bg-subtle",
      borderClass: "border-ui-border-base",
      accentClass: isCritical ? "text-ui-fg-error" : "text-ui-fg-subtle",
      badgeClass: isCritical ? "text-ui-fg-error" : "text-ui-fg-muted",
      actionClass: isCritical ? "danger" : "primary",
      badge: labels.badge,
      label: labels.label,
      description: descriptionFor(safeState, fileCount),
      badgeColor: emotion.badgeColor,
    }
  }, [state, fileCount])
}
