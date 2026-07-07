import React from "react"

import { Container, Input, Text } from "../../../../../ui/vendor"
import { FileClock, Info } from "../../../../../ui/vendor/lucide"
import type { SnapshotUseCase } from "../../types/snapshot-workflow"
import { ViewHeader } from "./ViewHeader"

export type MetadataViewProps = {
  snapshotName: string
  snapshotDescription: string
  snapshotBusinessContext: string
  snapshotUseCase: SnapshotUseCase
  selectedCount: number
  onSetName: (name: string) => void
  onSetDescription: (description: string) => void
  onSetBusinessContext: (context: string) => void
  onSetUseCase: (useCase: SnapshotUseCase) => void
}

const useCaseOptions = [
  { value: "manual", label: "دستی" },
  { value: "before_update", label: "قبل از به‌روزرسانی محصول" },
  { value: "before_theme_change", label: "قبل از تغییر قالب" },
  { value: "before_plugin_install", label: "قبل از نصب افزونه" },
]

export const MetadataView: React.FC<MetadataViewProps> = ({
  snapshotName,
  snapshotDescription,
  snapshotBusinessContext,
  snapshotUseCase,
  selectedCount,
  onSetName,
  onSetDescription,
  onSetBusinessContext,
  onSetUseCase,
}) => {
  return (
    <div className="flex h-full flex-col">
      <ViewHeader
        icon={<FileClock className="size-4" />}
        title="اطلاعات اسنپ‌شات"
        subtitle={`${selectedCount} فایل انتخاب شده`}
        tone="green"
      />

      <div className="flex-1 overflow-y-auto py-4">
        <Container className="p-0">
          <div className="flex flex-col gap-y-4 px-4 py-4">
            <div className="flex flex-col gap-y-2">
              <Text size="small" leading="compact" weight="plus">
                نام *
              </Text>
              <Input
                type="text"
                placeholder="مثلا: قبل از به‌روزرسانی"
                value={snapshotName}
                onChange={(event) => onSetName(event.target.value)}
                autoFocus
              />
              {!snapshotName.trim() && (
                <Text size="small" leading="compact" className="text-ui-fg-error">
                  وارد کردن نام الزامی است
                </Text>
              )}
            </div>

            <div className="flex flex-col gap-y-2">
              <Text size="small" leading="compact" weight="plus">
                زمینه کاری
              </Text>
              <select
                value={snapshotUseCase}
                onChange={(event) =>
                  onSetUseCase(event.target.value as SnapshotUseCase)
                }
                className="txt-compact-small h-8 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-ui-fg-base outline-none transition-colors hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-focus"
              >
                {useCaseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-y-2">
              <Text size="small" leading="compact" weight="plus">
                زمینه کسب‌وکار
              </Text>
              <textarea
                placeholder="مثلا: آماده‌سازی برای انتشار"
                value={snapshotBusinessContext}
                onChange={(event) => onSetBusinessContext(event.target.value)}
                rows={2}
                className="txt-compact-small min-h-16 w-full resize-none rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-2 text-ui-fg-base outline-none transition-colors placeholder:text-ui-fg-muted hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-focus"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Text size="small" leading="compact" weight="plus">
                توضیحات
              </Text>
              <textarea
                placeholder="توضیحات بیشتر..."
                value={snapshotDescription}
                onChange={(event) => onSetDescription(event.target.value)}
                rows={2}
                className="txt-compact-small min-h-16 w-full resize-none rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-2 text-ui-fg-base outline-none transition-colors placeholder:text-ui-fg-muted hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-focus"
              />
            </div>

            <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
              <div className="flex items-center justify-between gap-x-4">
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  فایل‌های انتخاب شده
                </Text>
                <Text size="small" leading="compact" weight="plus">
                  {selectedCount}
                </Text>
              </div>
            </div>

            <div className="flex items-start gap-x-2 rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
              <Info className="mt-0.5 size-4 flex-shrink-0 text-ui-fg-subtle" />
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                {!snapshotName.trim()
                  ? "لطفا یک نام برای اسنپ‌شات وارد کنید"
                  : "اطلاعات لازم وارد شده است. برای ادامه کلیک کنید."}
              </Text>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}

export default MetadataView
