// ============================================================
// EXPERIENCE CONTRACT - Medusa UI aligned
// Keeps wizard/domain experience modular while removing custom visuals.
// ============================================================

import { resolveMotion, type MotionState } from "./motion"

export type ExperienceState =
  | "idle"
  | "analyzing"
  | "selecting"
  | "metadata"
  | "review"
  | "creating"
  | "done"
  | "error"

export type UISpec = {
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
  progressGradient: string
  buttonPrimary: string
  buttonSecondary: string
  buttonDisabled: string
  stateClass: string
  motionDuration: number
  motionEasing: string
  motionKey: string
  showProgress: boolean
  showBack: boolean
  icon: string
  title: string
  description: string
  nextLabel: string
  backLabel: string
  nextDisabled: boolean
  progress: string
  badgeColor: "grey" | "green" | "orange" | "red" | "blue"
  buttonVariant: "primary" | "secondary" | "danger"
  motionClassName: string
  busy: boolean
}

type VisualPart = Pick<
  UISpec,
  | "bg"
  | "bgBadge"
  | "bgProgress"
  | "text"
  | "textBadge"
  | "border"
  | "borderBadge"
  | "light"
  | "dark"
  | "iconColor"
  | "stripeColor"
  | "progressGradient"
  | "buttonPrimary"
  | "buttonSecondary"
  | "buttonDisabled"
  | "stateClass"
  | "badgeColor"
  | "buttonVariant"
>

const baseVisual: VisualPart = {
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
  progressGradient: "bg-ui-bg-disabled",
  buttonPrimary: "primary",
  buttonSecondary: "secondary",
  buttonDisabled: "secondary",
  stateClass: "bg-ui-bg-base",
  badgeColor: "grey",
  buttonVariant: "secondary",
}

const visualMap: Record<ExperienceState, VisualPart> = {
  idle: baseVisual,
  analyzing: { ...baseVisual, bg: "bg-ui-bg-subtle", badgeColor: "blue" },
  selecting: { ...baseVisual, badgeColor: "blue", buttonVariant: "primary" },
  metadata: { ...baseVisual, badgeColor: "blue", buttonVariant: "primary" },
  review: { ...baseVisual, badgeColor: "green", buttonVariant: "primary" },
  creating: { ...baseVisual, bg: "bg-ui-bg-subtle", badgeColor: "blue" },
  done: { ...baseVisual, badgeColor: "green", buttonVariant: "primary" },
  error: {
    ...baseVisual,
    text: "text-ui-fg-error",
    textBadge: "text-ui-fg-error",
    iconColor: "text-ui-fg-error",
    badgeColor: "red",
    buttonVariant: "danger",
  },
}

const layoutMap: Record<ExperienceState, Pick<UISpec, "showProgress" | "showBack">> = {
  idle: { showProgress: false, showBack: false },
  analyzing: { showProgress: true, showBack: false },
  selecting: { showProgress: true, showBack: false },
  metadata: { showProgress: true, showBack: true },
  review: { showProgress: true, showBack: true },
  creating: { showProgress: false, showBack: false },
  done: { showProgress: false, showBack: false },
  error: { showProgress: false, showBack: false },
}

const narrativeMap: Record<ExperienceState, Pick<UISpec, "icon" | "title" | "description" | "nextLabel" | "backLabel" | "nextDisabled">> = {
  idle: { icon: "folder", title: "آماده", description: "", nextLabel: "شروع", backLabel: "", nextDisabled: true },
  analyzing: { icon: "search", title: "تحلیل تغییرات", description: "در حال اسکن مخزن...", nextLabel: "...", backLabel: "", nextDisabled: true },
  selecting: { icon: "folder", title: "انتخاب فایل‌ها", description: "فایل‌های تغییر یافته", nextLabel: "ادامه", backLabel: "", nextDisabled: false },
  metadata: { icon: "document", title: "اطلاعات اسنپ‌شات", description: "تکمیل اطلاعات", nextLabel: "ادامه", backLabel: "قبلی", nextDisabled: false },
  review: { icon: "check", title: "بررسی و ایجاد", description: "لطفاً اطلاعات را بررسی کنید", nextLabel: "ایجاد اسنپ‌شات", backLabel: "قبلی", nextDisabled: false },
  creating: { icon: "loader", title: "در حال ایجاد...", description: "لطفاً چند لحظه صبر کنید", nextLabel: "...", backLabel: "", nextDisabled: true },
  done: { icon: "check", title: "تکمیل شد", description: "اسنپ‌شات با موفقیت ایجاد شد", nextLabel: "بستن", backLabel: "", nextDisabled: false },
  error: { icon: "alert", title: "خطا", description: "خطای غیرمنتظره رخ داد", nextLabel: "تلاش مجدد", backLabel: "", nextDisabled: false },
}

const progressMap: Record<ExperienceState, string> = {
  idle: "0",
  analyzing: "0",
  selecting: "33",
  metadata: "66",
  review: "100",
  creating: "100",
  done: "100",
  error: "0",
}

export const resolveExperience = (state: ExperienceState): UISpec => {
  const safeState = state ?? "idle"
  const motion = resolveMotion(safeState as MotionState)

  return {
    ...visualMap[safeState],
    ...layoutMap[safeState],
    ...narrativeMap[safeState],
    progress: progressMap[safeState],
    motionDuration: motion.duration,
    motionEasing: motion.easing,
    motionKey: safeState,
    motionClassName: motion.className,
    busy: motion.busy,
  }
}

export const experience = {
  resolve: resolveExperience,
  states: ["idle", "analyzing", "selecting", "metadata", "review", "creating", "done", "error"] as const,
}
