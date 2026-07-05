// ============================================================
// RESOLVER - Single source of truth for UI experience
// Medusa semantic tokens only. No dynamic classes or custom visuals.
// ============================================================

import { resolveMotion } from "../motion"
import { resolveTokens } from "../tokens/visual"

export type ResolverState =
  | "idle"
  | "analyzing"
  | "selecting"
  | "metadata"
  | "review"
  | "creating"
  | "done"
  | "error"

export type ResolverContext = {
  filesCount: number
  selectedCount: number
  name: string
  error: string | null
  stepIndex?: number
}

export type UISpec = {
  emotion: {
    color: string
    badge: string
    badgeClass: string
    badgeColor: "grey" | "green" | "orange" | "red" | "blue"
  }
  visual: {
    bg: string
    text: string
    border: string
    iconColor: string
    stripeColor: string
    progress: string
    progressGradient: string
  }
  button: {
    primary: string
    secondary: string
    disabled: string
  }
  motion: {
    duration: number
    easing: string
    key: string
    enter: string
    exit: string
    className: string
    busy: boolean
  }
  layout: {
    showProgress: boolean
    showBack: boolean
    scrollBody: string
    header: string
    footer: string
  }
  narrative: {
    icon: string
    title: string
    description: string
    nextLabel: string
    backLabel: string
    nextDisabled: boolean
  }
  progress: string
}

const layoutMap: Record<ResolverState, { showProgress: boolean; showBack: boolean }> = {
  idle: { showProgress: false, showBack: false },
  analyzing: { showProgress: true, showBack: false },
  selecting: { showProgress: true, showBack: false },
  metadata: { showProgress: true, showBack: true },
  review: { showProgress: true, showBack: true },
  creating: { showProgress: false, showBack: false },
  done: { showProgress: false, showBack: false },
  error: { showProgress: false, showBack: false },
}

const narrativeMap: Record<ResolverState, UISpec["narrative"]> = {
  idle: { icon: "folder", title: "آماده", description: "", nextLabel: "شروع", backLabel: "", nextDisabled: true },
  analyzing: { icon: "search", title: "تحلیل تغییرات", description: "در حال اسکن مخزن...", nextLabel: "...", backLabel: "", nextDisabled: true },
  selecting: { icon: "folder", title: "انتخاب فایل‌ها", description: "فایل‌های تغییر یافته", nextLabel: "ادامه", backLabel: "", nextDisabled: false },
  metadata: { icon: "document", title: "اطلاعات اسنپ‌شات", description: "تکمیل اطلاعات", nextLabel: "ادامه", backLabel: "قبلی", nextDisabled: false },
  review: { icon: "check", title: "بررسی و ایجاد", description: "لطفاً اطلاعات را بررسی کنید", nextLabel: "ایجاد اسنپ‌شات", backLabel: "قبلی", nextDisabled: false },
  creating: { icon: "loader", title: "در حال ایجاد...", description: "لطفاً چند لحظه صبر کنید", nextLabel: "...", backLabel: "", nextDisabled: true },
  done: { icon: "check", title: "تکمیل شد", description: "اسنپ‌شات با موفقیت ایجاد شد", nextLabel: "بستن", backLabel: "", nextDisabled: false },
  error: { icon: "alert", title: "خطا", description: "خطای غیرمنتظره رخ داد", nextLabel: "تلاش مجدد", backLabel: "", nextDisabled: false },
}

const emotionMap: Record<ResolverState, UISpec["emotion"]> = {
  idle: { color: "neutral", badge: "آماده", badgeClass: "text-ui-fg-muted", badgeColor: "grey" },
  analyzing: { color: "indigo", badge: "در حال", badgeClass: "text-ui-fg-muted", badgeColor: "blue" },
  selecting: { color: "indigo", badge: "انتخاب", badgeClass: "text-ui-fg-muted", badgeColor: "blue" },
  metadata: { color: "indigo", badge: "اطلاعات", badgeClass: "text-ui-fg-muted", badgeColor: "blue" },
  review: { color: "emerald", badge: "بررسی", badgeClass: "text-ui-fg-muted", badgeColor: "green" },
  creating: { color: "indigo", badge: "ایجاد", badgeClass: "text-ui-fg-muted", badgeColor: "blue" },
  done: { color: "emerald", badge: "تکمیل", badgeClass: "text-ui-fg-muted", badgeColor: "green" },
  error: { color: "rose", badge: "خطا", badgeClass: "text-ui-fg-error", badgeColor: "red" },
}

const progressMap: Record<ResolverState, string> = {
  idle: "0",
  analyzing: "0",
  selecting: "33",
  metadata: "66",
  review: "100",
  creating: "100",
  done: "100",
  error: "0",
}

export const resolveUI = (state: ResolverState, _context?: Partial<ResolverContext>): UISpec => {
  const safeState = state ?? "idle"
  const visualTokens = resolveTokens(safeState)
  const motion = resolveMotion(safeState)
  const layout = layoutMap[safeState]

  return {
    emotion: emotionMap[safeState],
    visual: {
      bg: visualTokens.bg,
      text: visualTokens.text,
      border: visualTokens.border,
      iconColor: visualTokens.iconColor,
      stripeColor: visualTokens.stripeColor,
      progress: visualTokens.progress,
      progressGradient: visualTokens.progress,
    },
    button: {
      primary: visualTokens.buttonPrimary,
      secondary: visualTokens.buttonSecondary,
      disabled: visualTokens.buttonDisabled,
    },
    motion: {
      duration: motion.duration,
      easing: motion.easing,
      key: safeState,
      enter: motion.enter,
      exit: motion.exit,
      className: motion.className,
      busy: motion.busy,
    },
    layout: {
      ...layout,
      scrollBody: "overflow-y-auto",
      header: "bg-ui-bg-base border-ui-border-base",
      footer: "bg-ui-bg-base border-ui-border-base",
    },
    narrative: narrativeMap[safeState],
    progress: progressMap[safeState],
  }
}

export const resolveUi = resolveUI
export const resolveWizardUI = resolveUI
export const resolver = { resolve: resolveUI }
