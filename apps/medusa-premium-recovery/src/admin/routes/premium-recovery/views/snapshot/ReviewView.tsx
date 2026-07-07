import type { ReactNode } from "react"

import { Text } from "../../../../../ui/vendor"
import { CheckCircle2 } from "../../../../../ui/vendor/lucide"
import type { SnapshotUseCase } from "../../types/snapshot-workflow"

export type ReviewViewProps = {
  snapshotName: string
  snapshotDescription: string
  snapshotBusinessContext: string
  snapshotUseCase: SnapshotUseCase
  selectedCount: number
}

const useCaseLabels: Record<SnapshotUseCase, string> = {
  manual: "Manual capture",
  before_update: "Before product update",
  before_theme_change: "Before theme change",
  before_plugin_install: "Before plugin install",
}

const SummaryRow = ({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) => {
  return (
    <div className="grid gap-2 border-b border-ui-border-base px-4 py-3 last:border-b-0 md:grid-cols-[11rem_minmax(0,1fr)] md:items-start">
      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text size="small" leading="compact" weight="plus" className="break-words">
        {value}
      </Text>
    </div>
  )
}

export const ReviewView = ({
  snapshotName,
  snapshotDescription,
  snapshotBusinessContext,
  snapshotUseCase,
  selectedCount,
}: ReviewViewProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col justify-center">
      <div>
        <div className="overflow-hidden rounded-lg border border-ui-border-base">
          <SummaryRow label="Name" value={snapshotName || "Untitled snapshot record"} />
          <SummaryRow
            label="Use case"
            value={useCaseLabels[snapshotUseCase] || snapshotUseCase}
          />
          <SummaryRow label="Selected files" value={selectedCount} />
          {snapshotBusinessContext ? (
            <SummaryRow label="Business context" value={snapshotBusinessContext} />
          ) : null}
          {snapshotDescription ? (
            <SummaryRow label="Description" value={snapshotDescription} />
          ) : null}
        </div>

        <div className="mt-3 flex items-start gap-x-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ui-fg-success" />
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Creating the record will capture the selected workspace files and write a manifest.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default ReviewView
