import type { ReactNode } from "react"

import { Text, clsx } from "../../../../../ui/vendor"

type ViewHeaderTone = "blue" | "green" | "orange" | "red" | "neutral"

export type ViewHeaderProps = {
  icon: ReactNode
  title: string
  subtitle: string
  tone?: ViewHeaderTone
}

const toneClasses: Record<ViewHeaderTone, string> = {
  blue: "bg-ui-bg-subtle text-ui-fg-interactive",
  green: "bg-ui-bg-subtle text-ui-fg-success",
  orange: "bg-ui-bg-subtle text-ui-fg-warning",
  red: "bg-ui-bg-subtle text-ui-fg-error",
  neutral: "bg-ui-bg-subtle text-ui-fg-subtle",
}

export const ViewHeader = ({
  icon,
  title,
  subtitle,
  tone = "neutral",
}: ViewHeaderProps) => {
  return (
    <div className="flex items-center gap-x-3 border-b border-ui-border-base pb-4">
      <div
        className={clsx(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border border-ui-border-base shadow-elevation-card-rest",
          toneClasses[tone]
        )}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <Text size="small" leading="compact" weight="plus">
          {title}
        </Text>
        <Text size="small" leading="compact" className="mt-1 text-ui-fg-subtle">
          {subtitle}
        </Text>
      </div>
    </div>
  )
}

export default ViewHeader
