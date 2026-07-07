import {
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from "../../../../../ui/vendor"
import { Info } from "../../../../../ui/vendor/lucide"
import type { SnapshotUseCase } from "../../types/snapshot-workflow"

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

const useCaseOptions: Array<{ value: SnapshotUseCase; label: string }> = [
  { value: "manual", label: "Manual capture" },
  { value: "before_update", label: "Before product update" },
  { value: "before_theme_change", label: "Before theme change" },
  { value: "before_plugin_install", label: "Before plugin install" },
]

export const MetadataView = ({
  snapshotName,
  snapshotDescription,
  snapshotBusinessContext,
  snapshotUseCase,
  selectedCount,
  onSetName,
  onSetDescription,
  onSetBusinessContext,
  onSetUseCase,
}: MetadataViewProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col justify-center">
      <div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-y-2 md:col-span-2">
            <Label className="txt-compact-small-plus">
              Name
            </Label>
            <Input
              type="text"
              placeholder="Before product update"
              value={snapshotName}
              onChange={(event) => onSetName(event.target.value)}
              autoFocus
            />
            {!snapshotName.trim() ? (
              <Text size="small" leading="compact" className="text-ui-fg-error">
                A name is required before the record can be created.
              </Text>
            ) : null}
          </div>

          <div className="flex flex-col gap-y-2 md:col-span-2">
            <Label className="txt-compact-small-plus">
              Use case
            </Label>
            <Select
              value={snapshotUseCase}
              onValueChange={(value) => onSetUseCase(value as SnapshotUseCase)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select use case" />
              </Select.Trigger>
              <Select.Content>
                {useCaseOptions.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label className="txt-compact-small-plus">
              Business context
            </Label>
            <Textarea
              placeholder="Optional context for why these files are being captured"
              value={snapshotBusinessContext}
              onChange={(event) => onSetBusinessContext(event.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label className="txt-compact-small-plus">
              Description
            </Label>
            <Textarea
              placeholder="Optional notes for this snapshot record"
              value={snapshotDescription}
              onChange={(event) => onSetDescription(event.target.value)}
              rows={3}
            />
          </div>

          <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-2.5 md:col-span-2">
            <div className="flex items-center justify-between gap-x-4">
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Selected files
              </Text>
              <Text size="small" leading="compact" weight="plus">
                {selectedCount}
              </Text>
            </div>
          </div>

          <div className="flex items-start gap-x-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-3 py-2 md:col-span-2">
            <Info className="mt-0.5 size-4 shrink-0 text-ui-fg-subtle" />
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              The record will only include files selected in the previous step.
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetadataView
