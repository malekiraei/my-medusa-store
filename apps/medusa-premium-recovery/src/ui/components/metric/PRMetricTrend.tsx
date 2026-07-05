import { Area, AreaChart, Line, LineChart, ResponsiveContainer } from "../../vendor/charts"
import { clsx } from "../../vendor/mantine"
import { toneClasses, type PRMetricTone } from "../../adapters/status"

export type PRMetricTrendPoint = {
  name?: string
  value: number
}

export type PRMetricTrendProps = {
  data?: PRMetricTrendPoint[]
  tone?: PRMetricTone
  variant?: "area" | "line"
  height?: number
  className?: string
}

export const PRMetricTrend = ({
  data,
  tone = "neutral",
  variant = "area",
  height = 42,
  className,
}: PRMetricTrendProps) => {
  if (!data || data.length < 2) {
    return null
  }

  const toneClass = toneClasses[tone]

  return (
    <div
      className={clsx(
        "pointer-events-none -mx-1 overflow-hidden opacity-90",
        toneClass.chart,
        className
      )}
      aria-hidden="true"
    >
      <ResponsiveContainer width="100%" height={height}>
        {variant === "line" ? (
          <LineChart data={data} margin={{ top: 6, right: 2, bottom: 0, left: 2 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={2.5}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        ) : (
          <AreaChart data={data} margin={{ top: 6, right: 2, bottom: 0, left: 2 }}>
            <Area
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={2.5}
              fill="currentColor"
              fillOpacity={0.14}
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
