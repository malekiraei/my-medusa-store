// ============================================================
// PROJECTION - Backward-compatible UI projection
// Medusa semantic tokens only. No dynamic Tailwind classes.
// ============================================================

export type ProjectionState =
  | "idle"
  | "analyzing"
  | "selecting"
  | "metadata"
  | "review"
  | "creating"
  | "done"
  | "error"

export type UISpec = {
  color: "neutral" | "emerald" | "amber" | "rose" | "indigo"
  accent: string
  text: string
  badge: string
  badgeClass: string
  badgeColor: "grey" | "green" | "orange" | "red" | "blue"
  duration: number
  easing: string
  enter: string
  exit: string
  className: string
  busy: boolean
  showProgress: boolean
  showBack: boolean
  scroll: boolean
  icon: string
  title: string
  description: string
  nextLabel: string
  backLabel: string
  nextDisabled: boolean
  variant: "primary" | "secondary" | "danger"
  accentClass: string
  textClass: string
  bgClass: string
  borderClass: string
  progress: number
  steps: string[]
  currentStep: number
  totalSteps: number
}

const steps = ["selecting", "metadata", "review"]

const map: Record<ProjectionState, Omit<UISpec, "progress" | "currentStep" | "totalSteps" | "steps">> = {
  idle: { color: "neutral", accent: "text-ui-fg-subtle", text: "text-ui-fg-base", badge: "آماده", badgeClass: "text-ui-fg-muted", badgeColor: "grey", duration: 160, easing: "ease-out", enter: "transition-opacity", exit: "transition-opacity", className: "transition-colors", busy: false, showProgress: false, showBack: false, scroll: true, icon: "folder", title: "آماده", description: "", nextLabel: "شروع", backLabel: "", nextDisabled: true, variant: "secondary", accentClass: "text-ui-fg-subtle", textClass: "text-ui-fg-base", bgClass: "bg-ui-bg-base", borderClass: "border-ui-border-base" },
  analyzing: { color: "indigo", accent: "text-ui-fg-subtle", text: "text-ui-fg-base", badge: "در حال", badgeClass: "text-ui-fg-muted", badgeColor: "blue", duration: 160, easing: "ease-out", enter: "transition-opacity", exit: "transition-opacity", className: "transition-opacity", busy: true, showProgress: true, showBack: false, scroll: false, icon: "search", title: "تحلیل تغییرات", description: "در حال اسکن مخزن...", nextLabel: "...", backLabel: "", nextDisabled: true, variant: "secondary", accentClass: "text-ui-fg-subtle", textClass: "text-ui-fg-base", bgClass: "bg-ui-bg-subtle", borderClass: "border-ui-border-base" },
  selecting: { color: "indigo", accent: "text-ui-fg-subtle", text: "text-ui-fg-base", badge: "انتخاب", badgeClass: "text-ui-fg-muted", badgeColor: "blue", duration: 160, easing: "ease-out", enter: "transition-opacity", exit: "transition-opacity", className: "transition-colors", busy: false, showProgress: true, showBack: false, scroll: true, icon: "folder", title: "انتخاب فایل‌ها", description: "فایل‌های تغییر یافته", nextLabel: "ادامه", backLabel: "", nextDisabled: false, variant: "primary", accentClass: "text-ui-fg-subtle", textClass: "text-ui-fg-base", bgClass: "bg-ui-bg-base", borderClass: "border-ui-border-base" },
  metadata: { color: "indigo", accent: "text-ui-fg-subtle", text: "text-ui-fg-base", badge: "اطلاعات", badgeClass: "text-ui-fg-muted", badgeColor: "blue", duration: 160, easing: "ease-out", enter: "transition-opacity", exit: "transition-opacity", className: "transition-colors", busy: false, showProgress: true, showBack: true, scroll: true, icon: "document", title: "اطلاعات اسنپ‌شات", description: "تکمیل اطلاعات", nextLabel: "ادامه", backLabel: "قبلی", nextDisabled: false, variant: "primary", accentClass: "text-ui-fg-subtle", textClass: "text-ui-fg-base", bgClass: "bg-ui-bg-base", borderClass: "border-ui-border-base" },
  review: { color: "emerald", accent: "text-ui-fg-subtle", text: "text-ui-fg-base", badge: "بررسی", badgeClass: "text-ui-fg-muted", badgeColor: "green", duration: 160, easing: "ease-out", enter: "transition-opacity", exit: "transition-opacity", className: "transition-colors", busy: false, showProgress: true, showBack: true, scroll: true, icon: "check", title: "بررسی و ایجاد", description: "لطفاً اطلاعات را بررسی کنید", nextLabel: "ایجاد اسنپ‌شات", backLabel: "قبلی", nextDisabled: false, variant: "primary", accentClass: "text-ui-fg-subtle", textClass: "text-ui-fg-base", bgClass: "bg-ui-bg-base", borderClass: "border-ui-border-base" },
  creating: { color: "indigo", accent: "text-ui-fg-subtle", text: "text-ui-fg-base", badge: "ایجاد", badgeClass: "text-ui-fg-muted", badgeColor: "blue", duration: 160, easing: "ease-out", enter: "transition-opacity", exit: "transition-opacity", className: "transition-opacity", busy: true, showProgress: false, showBack: false, scroll: false, icon: "loader", title: "در حال ایجاد...", description: "لطفاً چند لحظه صبر کنید", nextLabel: "...", backLabel: "", nextDisabled: true, variant: "secondary", accentClass: "text-ui-fg-subtle", textClass: "text-ui-fg-base", bgClass: "bg-ui-bg-subtle", borderClass: "border-ui-border-base" },
  done: { color: "emerald", accent: "text-ui-fg-subtle", text: "text-ui-fg-base", badge: "تکمیل", badgeClass: "text-ui-fg-muted", badgeColor: "green", duration: 160, easing: "ease-out", enter: "transition-opacity", exit: "transition-opacity", className: "transition-colors", busy: false, showProgress: false, showBack: false, scroll: false, icon: "check", title: "تکمیل شد", description: "اسنپ‌شات با موفقیت ایجاد شد", nextLabel: "بستن", backLabel: "", nextDisabled: false, variant: "primary", accentClass: "text-ui-fg-subtle", textClass: "text-ui-fg-base", bgClass: "bg-ui-bg-base", borderClass: "border-ui-border-base" },
  error: { color: "rose", accent: "text-ui-fg-error", text: "text-ui-fg-error", badge: "خطا", badgeClass: "text-ui-fg-error", badgeColor: "red", duration: 160, easing: "ease-out", enter: "transition-opacity", exit: "transition-opacity", className: "transition-colors", busy: false, showProgress: false, showBack: false, scroll: false, icon: "alert", title: "خطا", description: "خطای غیرمنتظره رخ داد", nextLabel: "تلاش مجدد", backLabel: "", nextDisabled: false, variant: "danger", accentClass: "text-ui-fg-error", textClass: "text-ui-fg-error", bgClass: "bg-ui-bg-base", borderClass: "border-ui-border-base" },
}

export const project = (state: ProjectionState): UISpec => {
  const safeState = state ?? "idle"
  const base = map[safeState]
  const stepIndex = steps.indexOf(safeState)
  const progress = safeState === "done" || safeState === "creating" ? 100 : stepIndex >= 0 ? Math.round(((stepIndex + 1) / steps.length) * 100) : 0

  return {
    ...base,
    progress,
    steps,
    currentStep: stepIndex >= 0 ? stepIndex + 1 : 0,
    totalSteps: steps.length,
  }
}
