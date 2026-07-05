export type SnapshotWorkflowStatus =
  | "idle"
  | "loading"
  | "selecting"
  | "metadata"
  | "review"
  | "creating"
  | "done"
  | "error"

export type SnapshotFileStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "untracked"

export type SnapshotFile = {
  path: string
  status: SnapshotFileStatus
  oldPath?: string
  business_impact?: "critical" | "normal" | "low"
}

export type SnapshotUseCase =
  | "manual"
  | "before_update"
  | "before_theme_change"
  | "before_plugin_install"

export type SnapshotCreatePayload = {
  name: string
  description: string
  business_context: string
  use_case: SnapshotUseCase
  files: string[]
}

export type SnapshotFileManifest = {
  path: string
  status: "captured" | "missing"
  snapshot_path?: string | null
  size: number
  sha256: string | null
  missing_reason?: string | null
}

export type SnapshotRecord = {
  id: string
  name: string
  description?: string
  business_context?: string
  use_case?: SnapshotUseCase | string
  files: string[]
  files_count?: number
  captured_files_count?: number
  missing_files_count?: number
  created_at: string
  hash?: string
  manifest_files?: SnapshotFileManifest[]
  storage_path?: string
}

export type SnapshotWorkflowFile = SnapshotFile & {
  [key: string]: unknown
}

export type SnapshotWorkflowUseCase = SnapshotUseCase

export type SnapshotWorkflowState = {
  status: SnapshotWorkflowStatus
  files: SnapshotWorkflowFile[]
  selectedFiles: string[]
  name: string
  description: string
  businessContext: string
  useCase: SnapshotWorkflowUseCase
  error: string | null
}

export type SnapshotWorkflowEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "CREATE" }
  | { type: "RETRY" }
  | { type: "TOGGLE_FILE"; path: string }
  | { type: "SELECT_ALL" }
  | { type: "SET_NAME"; name: string }
  | { type: "SET_DESCRIPTION"; description: string }
  | { type: "SET_BUSINESS_CONTEXT"; context: string }
  | { type: "SET_USE_CASE"; useCase: SnapshotWorkflowUseCase }
