import type { ReactNode } from "react"

import { clsx } from "../../vendor/mantine"

export type PRMetricGridProps = {
  children: ReactNode
  className?: string
}

export const PRMetricGrid = ({ children, className }: PRMetricGridProps) => {
  return (
    <section className={clsx("grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </section>
  )
}
