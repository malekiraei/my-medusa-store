export type SystemStatusUI = {
  protection_level: "protected" | "partially_protected" | "unprotected"
  protection_message: string

  branch: string
  latest_snapshot: string | null

  bundle_count: number
  safety_active: boolean

  git_available: boolean
  is_clean: boolean

  last_successful_restore: string | null
  changed_files_count: number
}
