// ============================================================
// MOTION CONTRACT - Medusa native classes only
// No keyframes, no inline styles, no dynamic Tailwind classes.
// ============================================================

export type MotionState =
  | "idle"
  | "analyzing"
  | "selecting"
  | "metadata"
  | "review"
  | "creating"
  | "done"
  | "error"

export type MotionSpec = {
  className: string
  busy: boolean
  duration: number
  easing: string
  enter: string
  exit: string
  keyframes: string
}

const baseMotion: Omit<MotionSpec, "busy"> = {
  className: "transition-colors",
  duration: 160,
  easing: "ease-out",
  enter: "transition-opacity",
  exit: "transition-opacity",
  keyframes: "",
}

const motionMap: Record<MotionState, MotionSpec> = {
  idle: { ...baseMotion, busy: false },
  analyzing: { ...baseMotion, className: "transition-opacity", busy: true },
  selecting: { ...baseMotion, busy: false },
  metadata: { ...baseMotion, busy: false },
  review: { ...baseMotion, busy: false },
  creating: { ...baseMotion, className: "transition-opacity", busy: true },
  done: { ...baseMotion, busy: false },
  error: { ...baseMotion, busy: false },
}

export const resolveMotion = (state: MotionState): MotionSpec => {
  return motionMap[state] ?? motionMap.idle
}

export const motion = motionMap
export const defaultMotion = motionMap.idle
export const globalMotionStyles = ""
