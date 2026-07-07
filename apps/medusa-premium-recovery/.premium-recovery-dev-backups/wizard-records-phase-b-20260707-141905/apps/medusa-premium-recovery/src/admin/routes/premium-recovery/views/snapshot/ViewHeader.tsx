import React from "react"

import { Text, clsx } from "../../../../../ui/vendor"

type ViewHeaderTone = "blue" | "green" | "orange" | "red" | "neutral"

export type ViewHeaderProps = {
  icon: React.ReactNode
  title: string
  subtitle: string
  tone?: ViewHeaderTone
}

const toneClasses: Record<ViewHeaderTone, string> = {
  blue: "bg-ui-bg-subtle text-ui-fg-subtle",
  green: "bg-ui-bg-subtle text-ui-fg-success",
  orange: "bg-ui-bg-subtle text-ui-fg-warning",
  red: "bg-ui-bg-subtle text-ui-fg-error",
  neutral: "bg-ui-bg-subtle text-ui-fg-subtle",
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  icon,
  title,
  subtitle,
  tone = "neutral",
}) => {
  return (
    <div className="border-b border-ui-border-base pb-4">
      <div className="flex items-center gap-x-3">
        <div
          className={clsx(
            "flex size-8 flex-shrink-0 items-center justify-center rounded-md border border-ui-border-base",
            toneClasses[tone]
          )}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <Text size="small" leading="compact" weight="plus">
            {title}
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {subtitle}
          </Text>
        </div>
      </div>
    </div>
  )
}

export default ViewHeader
