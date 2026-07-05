import type { ComponentType } from "react"

import {
  CheckCircle2,
  Info,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from "../vendor/lucide"

export type PRMetricTone = "success" | "warning" | "error" | "info" | "neutral"
export type PRMetricIdentity = "system" | "changes" | "restore" | "bundles" | "neutral"

export type PRSystemStatus =
  | "protected"
  | "ready"
  | "changed"
  | "partial"
  | "partially_protected"
  | "critical"
  | "unprotected"
  | "active"
  | "available"
  | "empty"
  | "unknown"
  | string

export type PRStatusDescriptor = {
  tone: PRMetricTone
  label: string
  description: string
  icon: ComponentType<{ className?: string; strokeWidth?: string | number }>
}

const STATUS_MAP: Record<string, PRStatusDescriptor> = {
  protected: {
    tone: "success",
    label: "Snapshot Current",
    description: "File-backed snapshot records are current.",
    icon: ShieldCheck,
  },
  ready: {
    tone: "success",
    label: "Ready",
    description: "Snapshot data is available for review.",
    icon: CheckCircle2,
  },
  changed: {
    tone: "warning",
    label: "Changes Detected",
    description: "New file changes are waiting for review.",
    icon: TriangleAlert,
  },
  partial: {
    tone: "warning",
    label: "Partial Snapshot Coverage",
    description: "Some snapshot inputs need attention.",
    icon: TriangleAlert,
  },
  partially_protected: {
    tone: "warning",
    label: "Partial Snapshot Coverage",
    description: "Snapshot coverage is available but needs review.",
    icon: TriangleAlert,
  },
  critical: {
    tone: "error",
    label: "Critical",
    description: "Snapshot inputs require immediate action.",
    icon: ShieldAlert,
  },
  unprotected: {
    tone: "error",
    label: "No Snapshot Baseline",
    description: "No current file-backed snapshot baseline is available.",
    icon: ShieldAlert,
  },
  active: {
    tone: "info",
    label: "Active",
    description: "Snapshot checks are currently running.",
    icon: Info,
  },
  available: {
    tone: "info",
    label: "Available",
    description: "Snapshot data is available for review.",
    icon: Info,
  },
  empty: {
    tone: "neutral",
    label: "Empty",
    description: "No snapshot activity has been recorded yet.",
    icon: Shield,
  },
  unknown: {
    tone: "neutral",
    label: "Unknown",
    description: "System status has not been resolved yet.",
    icon: Shield,
  },
}

export const resolvePRStatus = (status?: PRSystemStatus): PRStatusDescriptor => {
  if (!status) {
    return STATUS_MAP.unknown
  }

  return STATUS_MAP[String(status).toLowerCase()] ?? {
    ...STATUS_MAP.unknown,
    label: String(status),
  }
}

export const toneClasses: Record<PRMetricTone, {
  badge: string
  chart: string
  ring: string
  progress: string
  surface: string
}> = {
  success: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800",
    chart: "text-emerald-500",
    ring: "ring-emerald-500/15",
    progress: "bg-emerald-500",
    surface: "border-emerald-200/70 dark:border-emerald-900/60",
  },
  warning: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800",
    chart: "text-amber-500",
    ring: "ring-amber-500/15",
    progress: "bg-amber-500",
    surface: "border-amber-200/70 dark:border-amber-900/60",
  },
  error: {
    badge: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800",
    chart: "text-rose-500",
    ring: "ring-rose-500/15",
    progress: "bg-rose-500",
    surface: "border-rose-200/70 dark:border-rose-900/60",
  },
  info: {
    badge: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-800",
    chart: "text-sky-500",
    ring: "ring-sky-500/15",
    progress: "bg-sky-500",
    surface: "border-sky-200/70 dark:border-sky-900/60",
  },
  neutral: {
    badge: "bg-ui-bg-subtle text-ui-fg-muted ring-ui-border-base",
    chart: "text-ui-fg-muted",
    ring: "ring-ui-border-base",
    progress: "bg-ui-fg-muted",
    surface: "border-ui-border-base",
  },
}

export const identityClasses: Record<PRMetricIdentity, {
  surface: string
  tile: Record<PRMetricTone, string>
  accent: Record<PRMetricTone, string>
  glow: Record<PRMetricTone, string>
  tileShadow: Record<PRMetricTone, string>
}> = {
  system: {
    surface: "bg-ui-bg-base",
    tile: {
      success: "bg-emerald-500 text-white",
      warning: "bg-amber-500 text-white",
      error: "bg-rose-500 text-white",
      info: "bg-sky-500 text-white",
      neutral: "bg-rose-500 text-white",
    },
    accent: {
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      error: "bg-rose-500",
      info: "bg-sky-500",
      neutral: "bg-rose-500",
    },
    glow: {
      success: "from-emerald-500/12 via-transparent to-transparent",
      warning: "from-amber-500/12 via-transparent to-transparent",
      error: "from-rose-500/12 via-transparent to-transparent",
      info: "from-sky-500/12 via-transparent to-transparent",
      neutral: "from-rose-500/12 via-transparent to-transparent",
    },
    tileShadow: {
      success: "shadow-emerald-500/20",
      warning: "shadow-amber-500/20",
      error: "shadow-rose-500/20",
      info: "shadow-sky-500/20",
      neutral: "shadow-slate-500/10",
    },
  },
  changes: {
    surface: "bg-ui-bg-base",
    tile: {
      success: "bg-emerald-500 text-white",
      warning: "bg-amber-500 text-white",
      error: "bg-rose-500 text-white",
      info: "bg-emerald-500 text-white",
      neutral: "bg-emerald-500 text-white",
    },
    accent: {
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      error: "bg-rose-500",
      info: "bg-emerald-500",
      neutral: "bg-emerald-500",
    },
    glow: {
      success: "from-emerald-500/12 via-transparent to-transparent",
      warning: "from-amber-500/12 via-transparent to-transparent",
      error: "from-rose-500/12 via-transparent to-transparent",
      info: "from-emerald-500/12 via-transparent to-transparent",
      neutral: "from-emerald-500/12 via-transparent to-transparent",
    },
    tileShadow: {
      success: "shadow-emerald-500/20",
      warning: "shadow-amber-500/20",
      error: "shadow-rose-500/20",
      info: "shadow-sky-500/20",
      neutral: "shadow-slate-500/10",
    },
  },
  restore: {
    surface: "bg-sky-50/30 dark:bg-sky-950/10",
    tile: {
      success: "bg-emerald-500 text-white",
      warning: "bg-amber-500 text-white",
      error: "bg-rose-500 text-white",
      info: "bg-amber-500 text-white",
      neutral: "bg-amber-500 text-white",
    },
    accent: {
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      error: "bg-rose-500",
      info: "bg-amber-500",
      neutral: "bg-amber-500",
    },
    glow: {
      success: "from-emerald-500/12 via-transparent to-transparent",
      warning: "from-amber-500/12 via-transparent to-transparent",
      error: "from-rose-500/12 via-transparent to-transparent",
      info: "from-amber-500/12 via-transparent to-transparent",
      neutral: "from-amber-500/12 via-transparent to-transparent",
    },
    tileShadow: {
      success: "shadow-sky-500/20",
      warning: "shadow-amber-500/20",
      error: "shadow-rose-500/20",
      info: "shadow-sky-500/20",
      neutral: "shadow-sky-500/10",
    },
  },
  bundles: {
    surface: "bg-violet-50/25 dark:bg-violet-950/10",
    tile: {
      success: "bg-emerald-500 text-white",
      warning: "bg-amber-500 text-white",
      error: "bg-rose-500 text-white",
      info: "bg-violet-500 text-white",
      neutral: "bg-violet-500 text-white",
    },
    accent: {
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      error: "bg-rose-500",
      info: "bg-violet-500",
      neutral: "bg-violet-500",
    },
    glow: {
      success: "from-emerald-500/12 via-transparent to-transparent",
      warning: "from-amber-500/12 via-transparent to-transparent",
      error: "from-rose-500/12 via-transparent to-transparent",
      info: "from-violet-500/12 via-transparent to-transparent",
      neutral: "from-violet-500/12 via-transparent to-transparent",
    },
    tileShadow: {
      success: "shadow-violet-500/20",
      warning: "shadow-amber-500/20",
      error: "shadow-rose-500/20",
      info: "shadow-violet-500/20",
      neutral: "shadow-violet-500/10",
    },
  },
  neutral: {
    surface: "bg-ui-bg-base",
    tile: {
      success: "bg-emerald-500 text-white",
      warning: "bg-amber-500 text-white",
      error: "bg-rose-500 text-white",
      info: "bg-sky-500 text-white",
      neutral: "bg-slate-500 text-white",
    },
    accent: {
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      error: "bg-rose-500",
      info: "bg-sky-500",
      neutral: "bg-slate-500",
    },
    glow: {
      success: "from-emerald-500/12 via-transparent to-transparent",
      warning: "from-amber-500/12 via-transparent to-transparent",
      error: "from-rose-500/12 via-transparent to-transparent",
      info: "from-sky-500/12 via-transparent to-transparent",
      neutral: "from-slate-500/12 via-transparent to-transparent",
    },
    tileShadow: {
      success: "shadow-emerald-500/20",
      warning: "shadow-amber-500/20",
      error: "shadow-rose-500/20",
      info: "shadow-sky-500/20",
      neutral: "shadow-slate-500/10",
    },
  },
}
