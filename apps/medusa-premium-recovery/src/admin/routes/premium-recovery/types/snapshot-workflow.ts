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
  scope?: string
  file_kind?: string
  policy_version?: string
  eligibility_reason?: string
  eligibility_warnings?: string[]
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
  policy_version?: string
  workspace_scope?: string
  eligibility_scopes?: string[]
  validated_at?: string
  validation_result?: string
  file_kind?: string
  original_relative_path?: string
  eligibility?: {
    eligible: boolean
    scope: string
    reason_code: string
    policy_version: string
    size_check?: {
      size: number
      limit: number
      passed: boolean
    } | null
  }
}

export type RestoreReadiness = {
  status: "Restorable" | "Restorable with warnings" | "Not restorable"
  policy_version: string
  legacy_policy: boolean
  restorable_files_count: number
  warning_files_count: number
  not_restorable_files_count: number
  reasons: string[]
  warnings: string[]
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
  manifest_schema_version?: number
  policy_version?: string
  workspace_scope?: string
  eligibility_scopes?: string[]
  validated_at?: string
  validation_result?: string
  eligibility_summary?: {
    policy_version: string
    approved_files_count: number
    rejected_files_count: number
    warning_count: number
    scopes: string[]
    total_size: number
  }
  restore_readiness?: RestoreReadiness
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
