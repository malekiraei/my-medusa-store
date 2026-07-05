// ============================================================
// STATE CONTRACT - Medusa UI aligned
// Domain meaning stays here. Components only render the contract.
// ============================================================

export type SystemState = "empty" | "stable" | "degraded" | "critical"

export type SystemStatusLike = {
  protection_level?: string
  safety_active?: boolean
  changed_files_count?: number
} | null

export type SystemStateConfig = {
  state: SystemState
  label: string
  badge: string
  description: (fileCount: number) => string
  icon: "shield" | "alert" | "database"
  badgeColor: "grey" | "green" | "orange" | "red"
  actionVariant: "primary" | "secondary" | "danger"
}

export const resolveSystemState = (
  status: SystemStatusLike,
  fileCount: number
): SystemState => {
  if (!status) return "empty"

  if (status.protection_level === "unprotected") return "critical"
  if (status.protection_level === "partially_protected") return "degraded"
  if (status.protection_level === "protected") return "stable"

  if (!status.safety_active) return "critical"
  if (fileCount > 10) return "critical"
  if (fileCount > 3) return "degraded"

  return "stable"
}

export const stateConfig: Record<SystemState, SystemStateConfig> = {
  empty: {
    state: "empty",
    label: "سیستم آماده است",
    badge: "آماده",
    description: () => "داده‌ای برای نمایش وجود ندارد",
    icon: "database",
    badgeColor: "grey",
    actionVariant: "secondary",
  },
  stable: {
    state: "stable",
    label: "سیستم پایدار",
    badge: "عادی",
    description: () => "همه سیستم‌ها در وضعیت عادی هستند",
    icon: "shield",
    badgeColor: "green",
    actionVariant: "primary",
  },
  degraded: {
    state: "degraded",
    label: "نیاز به بررسی",
    badge: "توجه",
    description: (count) => `${count} فایل تغییر کرده است`,
    icon: "shield",
    badgeColor: "orange",
    actionVariant: "secondary",
  },
  critical: {
    state: "critical",
    label: "سیستم در معرض خطر",
    badge: "فوری",
    description: (count) => `${count} فایل بدون محافظت شناسایی شده است`,
    icon: "alert",
    badgeColor: "red",
    actionVariant: "danger",
  },
}
