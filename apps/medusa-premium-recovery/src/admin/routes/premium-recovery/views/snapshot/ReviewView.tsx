import React from "react"

import { Container, Text } from "../../../../../ui/vendor"
import { CheckCircle2 } from "../../../../../ui/vendor/lucide"
import type { SnapshotUseCase } from "../../types/snapshot-workflow"
import { ViewHeader } from "./ViewHeader"

export type ReviewViewProps = {
  snapshotName: string
  snapshotDescription: string
  snapshotBusinessContext: string
  snapshotUseCase: SnapshotUseCase
  selectedCount: number
}

const useCaseLabels: Record<SnapshotUseCase, string> = {
  manual: "دستی",
  before_update: "قبل از به‌روزرسانی محصول",
  before_theme_change: "قبل از تغییر قالب",
  before_plugin_install: "قبل از نصب افزونه",
}

const SummaryRow = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => {
  return (
    <div className="flex items-start justify-between gap-x-4">
      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text size="small" leading="compact" weight="plus" className="max-w-64 truncate text-right">
        {value}
      </Text>
    </div>
  )
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  snapshotName,
  snapshotDescription,
  snapshotBusinessContext,
  snapshotUseCase,
  selectedCount,
}) => {
  return (
    <div className="flex h-full flex-col">
      <ViewHeader
        icon={<CheckCircle2 className="size-4" />}
        title="بازبینی"
        subtitle={`${selectedCount} فایل برای اسنپ‌شات`}
        tone="green"
      />

      <div className="flex-1 overflow-y-auto py-4">
        <Container className="p-0">
          <div className="flex flex-col gap-y-3 px-4 py-4">
            <SummaryRow label="نام" value={snapshotName || "—"} />
            <SummaryRow
              label="زمینه کاری"
              value={useCaseLabels[snapshotUseCase] || snapshotUseCase}
            />
            {snapshotBusinessContext && (
              <SummaryRow label="زمینه کسب‌وکار" value={snapshotBusinessContext} />
            )}
            {snapshotDescription && (
              <SummaryRow label="توضیحات" value={snapshotDescription} />
            )}
            <div className="border-t border-ui-border-base pt-3">
              <SummaryRow label="تعداد فایل‌ها" value={selectedCount} />
            </div>
          </div>
        </Container>

        <div className="mt-4 flex items-start gap-x-2 rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
          <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-ui-fg-success" />
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            برای ایجاد اسنپ‌شات کلیک کنید
          </Text>
        </div>
      </div>
    </div>
  )
}

export default ReviewView
