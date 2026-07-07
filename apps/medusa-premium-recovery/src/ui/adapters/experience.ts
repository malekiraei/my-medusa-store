export type PRExperienceState =
  | "idle"
  | "analyzing"
  | "selecting"
  | "metadata"
  | "review"
  | "creating"
  | "done"
  | "error"

export type PRExperienceView = {
  title: string
  description: string
  nextLabel: string
  backLabel: string
  nextDisabled: boolean
  showProgress: boolean
  showBack: boolean
  progress: number
}

const experienceMap: Record<PRExperienceState, PRExperienceView> = {
  idle: {
    title: "Ready",
    description: "",
    nextLabel: "Start",
    backLabel: "",
    nextDisabled: true,
    showProgress: false,
    showBack: false,
    progress: 0,
  },
  analyzing: {
    title: "Review workspace changes",
    description: "Checking the current Git changes.",
    nextLabel: "Checking...",
    backLabel: "",
    nextDisabled: true,
    showProgress: true,
    showBack: false,
    progress: 25,
  },
  selecting: {
    title: "Select files",
    description: "Choose which changed files should be captured.",
    nextLabel: "Continue",
    backLabel: "",
    nextDisabled: false,
    showProgress: true,
    showBack: false,
    progress: 33,
  },
  metadata: {
    title: "Add record details",
    description: "Name this file-backed snapshot record.",
    nextLabel: "Continue",
    backLabel: "Back",
    nextDisabled: false,
    showProgress: true,
    showBack: true,
    progress: 66,
  },
  review: {
    title: "Review capture",
    description: "Confirm the selected files before creating the record.",
    nextLabel: "Create Snapshot",
    backLabel: "Back",
    nextDisabled: false,
    showProgress: true,
    showBack: true,
    progress: 90,
  },
  creating: {
    title: "Creating snapshot",
    description: "Capturing selected workspace files.",
    nextLabel: "Creating...",
    backLabel: "",
    nextDisabled: true,
    showProgress: false,
    showBack: false,
    progress: 95,
  },
  done: {
    title: "Snapshot created",
    description: "The file-backed record was created successfully.",
    nextLabel: "Close",
    backLabel: "",
    nextDisabled: false,
    showProgress: false,
    showBack: false,
    progress: 100,
  },
  error: {
    title: "Snapshot could not be created",
    description: "Review the error and try again.",
    nextLabel: "Try again",
    backLabel: "",
    nextDisabled: false,
    showProgress: false,
    showBack: false,
    progress: 100,
  },
}

export function getExperienceView(state: PRExperienceState): PRExperienceView {
  return experienceMap[state] ?? experienceMap.idle
}

export function getExperienceStepLabel(state: PRExperienceState): string {
  const labels: Record<PRExperienceState, string> = {
    idle: "Ready",
    analyzing: "Checking files",
    selecting: "Select files",
    metadata: "Record details",
    review: "Review",
    creating: "Creating",
    done: "Created",
    error: "Error",
  }

  return labels[state] ?? state
}
