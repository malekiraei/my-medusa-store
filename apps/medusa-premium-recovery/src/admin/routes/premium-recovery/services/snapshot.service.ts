import {
  getExperienceStepLabel,
  type PRExperienceState as ExperienceState,
} from "../../../../ui/adapters/experience"
import type {
  SnapshotCreatePayload,
  SnapshotUseCase,
} from "../types/snapshot-workflow"

export interface WizardState {
  experienceState: ExperienceState
  step: string
  files: any[]
  selected: string[]
  error: string | null
  name: string
  description: string
  context: string
  useCase: SnapshotUseCase
  isAnalyzing: boolean
  isCreating: boolean
  isError: boolean
  isDone: boolean
}

export type NormalizedSnapshotPayload = SnapshotCreatePayload

export const snapshotService = {
  extractState(machineState: any): WizardState {
    const status = machineState?.status || "idle"
    const files = machineState?.files || []
    const selected = machineState?.selectedFiles || []

    const isAnalyzing = ["loading", "empty", "analyzing"].includes(status)
    const isCreating = status === "creating"
    const isError = status === "error"
    const isDone = status === "done"

    let experienceState: ExperienceState = "idle"
    if (isAnalyzing) experienceState = "analyzing"
    else if (status === "selecting") experienceState = "selecting"
    else if (status === "metadata") experienceState = "metadata"
    else if (status === "review") experienceState = "review"
    else if (isCreating) experienceState = "creating"
    else if (isDone) experienceState = "done"
    else if (isError) experienceState = "error"

    return {
      experienceState,
      step: status,
      files,
      selected,
      error: machineState?.error || null,
      name: machineState?.name || "",
      description: machineState?.description || "",
      context: machineState?.businessContext || "",
      useCase: machineState?.useCase || "manual",
      isAnalyzing,
      isCreating,
      isError,
      isDone,
    }
  },

  normalizePayload(data: {
    name: string
    description: string
    businessContext: string
    useCase: SnapshotUseCase
    files: string[]
  }): NormalizedSnapshotPayload {
    return {
      name: data.name.trim(),
      description: data.description.trim(),
      business_context: data.businessContext.trim(),
      use_case: data.useCase,
      files: data.files,
    }
  },

  isActionable(state: WizardState): boolean {
    return !state.isAnalyzing && !state.isCreating && !state.isDone && !state.isError
  },

  getStepLabel(experienceState: ExperienceState): string {
    return getExperienceStepLabel(experienceState)
  },
}
