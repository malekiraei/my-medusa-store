import React from "react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "../../vendor"

type Props = {
  safe: number
  warning: number
  critical: number
  neutral: number
}

const COLORS: Record<string, string> = {
  safe: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
  neutral: "#64748b",
}

const SEGMENTS = [
  { key: "safe", label: "Safe" },
  { key: "warning", label: "Warning" },
  { key: "critical", label: "Critical" },
  { key: "neutral", label: "Neutral" },
] as const

export function PRSystemHealthDonut({
  safe,
  warning,
  critical,
  neutral,
}: Props) {
  const data = [
    { name: "safe", value: safe },
    { name: "warning", value: warning },
    { name: "critical", value: critical },
    { name: "neutral", value: neutral },
  ]

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="relative w-full h-[220px] sm:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="70%"
            outerRadius="90%"
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-semibold text-ui-fg-base">
          {total}
        </div>
        <div className="text-xs text-ui-fg-muted">
          System Health
        </div>
      </div>
    </div>
  )
}

export default PRSystemHealthDonut