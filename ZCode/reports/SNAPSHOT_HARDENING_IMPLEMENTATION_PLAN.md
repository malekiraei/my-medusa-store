# Snapshot Creation Hardening Implementation Plan

Date: 2026-07-12
Scope: implementation plan only, no source/runtime/storage changes
Baseline report: `ZCode/reports/PREMIUM_RECOVERY_SNAPSHOT_AUDIT.md`

## Executive Decision

Snapshot Creation must be hardened by moving all file eligibility decisions into one backend-owned policy module and making every current and future entry point call that same module.

The central principle is:

> The UI may help users choose files, but the backend must be the authority. Any path submitted to snapshot creation or future restore must be normalized, resolved, realpath-checked, allowlisted, denylisted, and recorded with the policy version that approved it.

## 1. Central File Eligibility Policy Location

Create the central policy in the backend API service layer:

`apps/medusa-premium-recovery/src/api/admin/premium-recovery/_services/file-eligibility-policy.ts`

Why this layer:

- It is server-side, so users cannot bypass it by manually POSTing paths.
- It sits beside `snapshot-capture.ts`, `snapshot-manifest.ts`, `snapshot-storage.ts`, and `git-resolver.ts`, which already form the snapshot backend boundary.
- It can be imported by `git-changes/route.ts`, `restore-points/route.ts`, `snapshot-capture.ts`, and future restore routes without depending on Admin UI code.
- It avoids duplicating eligibility logic in frontend hooks and backend routes.

Recommended exported API:

```ts
export const SNAPSHOT_FILE_POLICY_VERSION = "snapshot-file-policy/v1"

export type EligibilityDecision =
  | {
      eligible: true
      policy_version: string
      normalized_path: string
      absolute_path: string
      real_path: string
      category: SnapshotFileCategory
      reason: string
      warnings: string[]
    }
  | {
      eligible: false
      policy_version: string
      normalized_path: string | null
      absolute_path: string | null
      real_path: string | null
      category: SnapshotFileCategory | "unknown"
      reason: string
      code: EligibilityRejectionCode
      warnings: string[]
    }

export function evaluateSnapshotPath(input: {
  workspaceRoot: string
  selectedPath: string
  gitStatus?: string
  mode: "git-changes" | "snapshot-create" | "restore"
}): Promise<EligibilityDecision>

export function evaluateSnapshotPaths(input: {
  workspaceRoot: string
  selectedPaths: string[]
  mode: "snapshot-create" | "restore"
}): Promise<EligibilityBatchResult>

export function isGitChangeSelectable(input: {
  workspaceRoot: string
  path: string
  status: string
}): Promise<EligibilityDecision>
```

The policy should own:

- path normalization
- workspace containment checks
- absolute path rejection rules
- `../` traversal rejection
- realpath and symlink checks
- denylist matching
- allowlist matching
- max file size
- max selected count
- category and reason strings
- policy version
- restorable classification for old manifests

## 2. Shared Use Across Git Changes, Snapshot Creation, and Future Restore

### `git-changes`

Change `apps/medusa-premium-recovery/src/api/admin/premium-recovery/git-changes/route.ts` to remove local constants:

- `SNAPSHOT_SOURCE_EXTENSIONS`
- `SNAPSHOT_CONFIG_FILES`
- `EXCLUDED_SNAPSHOT_PATH_PARTS`
- local `isSnapshotSelectableChange`

Instead:

- parse Git porcelain into `{ path, status }`
- call `isGitChangeSelectable({ workspaceRoot: gitRoot, path, status })`
- return only eligible files
- include `eligibility` metadata in each returned change:
  - `policy_version`
  - `category`
  - `reason`
  - `warnings`

The frontend should display what the backend returns. The frontend can still perform search/category UI, but it must not reimplement security filtering.

### Snapshot creation endpoint

Change `apps/medusa-premium-recovery/src/api/admin/premium-recovery/restore-points/route.ts` so `createRestorePoint()` validates the entire submitted `files` array through `evaluateSnapshotPaths()` before calling `captureSnapshotFiles()`.

The create route should:

1. validate body shape
2. resolve Git workspace root
3. check selected count
4. evaluate all selected paths with policy mode `snapshot-create`
5. reject if any file is ineligible, unless an explicit future partial policy is chosen
6. pass only approved normalized files to capture
7. write manifest with policy fields

### `snapshot-capture`

Refactor `apps/medusa-premium-recovery/src/api/admin/premium-recovery/_services/snapshot-capture.ts` so it no longer owns workspace security validation.

It should receive already-approved file descriptors:

```ts
type ApprovedSnapshotFile = {
  relativePath: string
  absolutePath: string
  realPath: string
  category: SnapshotFileCategory
  eligibility: EligibilityManifestInfo
}
```

`captureSnapshotFiles()` should still verify `stat().isFile()` immediately before copying to avoid TOCTOU surprises, but eligibility belongs to the policy module.

### Future Restore

Future restore route should call the same policy in `restore` mode:

- Re-evaluate every manifest `path`.
- Require stored `eligibility.policy_version`.
- For old manifests with no policy fields, classify using the current policy as historical/legacy.
- Block restore when current policy says `not restorable`.
- Verify blobs and hashes before any write.

Restore must never trust old manifest paths without re-validation.

## 3. Proposed Allowlist and Denylist

### Allowlist

For phase one, keep scope intentionally narrow:

Allowed roots:

- `apps/medusa-premium-recovery/src/`
- `apps/medusa-premium-recovery/package.json`
- `apps/medusa-premium-recovery/tsconfig.json`
- optionally after review: `apps/medusa-premium-recovery/eslint.config.ts`

Allowed source extensions:

- `.ts`
- `.tsx`
- `.js`
- `.jsx`
- `.json`
- `.css`
- `.scss`

Allowed config filenames:

- `package.json`
- `tsconfig.json`
- optional: `eslint.config.ts`

Explicitly not allowed in phase one:

- `.md`
- `.txt`
- `.zip`
- archive formats
- logs
- database files
- env files
- lock files
- generated artifacts
- arbitrary root-level workspace files
- files outside `apps/medusa-premium-recovery`

### Denylist Path Parts

The denylist should apply before allowlist success:

```text
.git
.cache
.medusa
.next
.premium-recovery
.runtime
.turbo
node_modules
dist
build
coverage
logs
restore-points
snapshots
temp
tmp
temp-extract
backups
backup
```

### Denylist File Names and Patterns

Secrets and environment:

```text
.env
.env.*
*.env
*.secret
*.secrets
*secret*
*secrets*
*credential*
*credentials*
*.pem
*.key
*.crt
*.p12
*.pfx
id_rsa
id_dsa
id_ecdsa
id_ed25519
```

Archives:

```text
*.zip
*.tar
*.tar.gz
*.tgz
*.rar
*.7z
*.gz
*.bz2
*.xz
```

Database/storage:

```text
*.sqlite
*.sqlite3
*.db
*.db3
*.dump
*.sql
*.bak
*.backup
*.psql
*.mdb
*.accdb
*.parquet
```

Logs/runtime:

```text
*.log
*.pid
*.lock-runtime
*.runtime
```

Binary/media/assets for phase one:

```text
*.png
*.jpg
*.jpeg
*.gif
*.webp
*.avif
*.ico
*.svg
*.woff
*.woff2
*.ttf
*.otf
*.mp4
*.webm
*.mov
```

Note: `.svg` can be source-like in UI projects, but phase one should deny it until there is explicit SVG sanitization and restore policy.

### Limits

Recommended limits:

- max files per snapshot: 100
- max individual file size: 1 MiB for phase one
- max total snapshot payload: 10 MiB
- reject duplicate normalized paths
- reject empty path strings
- reject NUL bytes and control characters

## 4. Expected Behavior by Category

| Input/category | Expected behavior | Reason |
| --- | --- | --- |
| `node_modules` | Reject | Third-party dependencies are generated/installed artifacts and too large/untrusted. |
| `.git` | Reject | Repository internals must never be snapshotted or restored by app logic. |
| `.env` and secrets | Reject | Prevent credential capture and accidental disclosure through manifests/storage. |
| `dist` / `build` | Reject | Generated outputs should be recreated by build, not restored. |
| `logs` | Reject | Logs may contain sensitive/runtime data and are not source of truth. |
| `.zip` / archives | Reject | Archives can hide unbounded/binary/secret content and are not restorable source files. |
| Database files | Reject | Database state requires separate backup/restore semantics, not file snapshot restore. |
| Binary files | Reject in phase one | Restore engine should begin with text/source/config files only. |
| Symlink path | Reject if selected path is symlink; reject if realpath escapes workspace | Prevent indirect access to outside workspace or unexpected targets. |
| Absolute path | Reject | API should accept only workspace-relative paths to avoid ambiguous user input. |
| `../` traversal | Reject | Prevent workspace escape attempts. |
| Files outside workspace | Reject | Snapshot scope is strictly the Git workspace and narrower plugin allowlist. |
| Directory | Reject | Snapshot Creation should accept regular files only. Do not convert to `missing`. |
| Deleted file | Reject for snapshot creation | No content exists to snapshot. Future restore may handle delete semantics separately. |
| Missing file | Reject for snapshot creation | Avoid creating new Partial records from invalid inputs. |
| Duplicate path | Reject request | Avoid manifest ambiguity. |

## 5. Snapshot Creation Revalidation Flow

`createRestorePoint()` should validate as follows:

1. Parse request body.
2. Require non-empty `name`.
3. Require `files` to be a non-empty array of strings.
4. Reject if `files.length > MAX_SNAPSHOT_FILES`.
5. Resolve Git workspace root using `resolveGitRoot()`.
6. Normalize each path:
   - replace `\` with `/`
   - trim
   - reject empty string
   - reject NUL/control characters
   - reject absolute paths
   - reject `.` or `..` segments
7. Resolve absolute path under workspace.
8. Verify resolved path is inside workspace.
9. Call `lstat()`:
   - reject missing
   - reject directory
   - reject symlink
10. Call `realpath()`:
   - reject if real path escapes workspace
   - reject if real path escapes allowed plugin root
11. Apply denylist path parts and filename patterns.
12. Apply allowlist root and extension/config rules.
13. Check file size.
14. Check duplicate normalized paths.
15. Return all approved descriptors or a structured rejection response.

Recommended rejection response:

```json
{
  "message": "Some selected files are not eligible for snapshot capture",
  "policy_version": "snapshot-file-policy/v1",
  "rejected_files": [
    {
      "path": "apps/medusa-premium-recovery/.env",
      "code": "secret_file",
      "reason": "Environment and secret files cannot be captured"
    }
  ]
}
```

## 6. Reject Whole Request vs Convert to Partial

### Option 1: Reject Whole Request on Any Invalid File

Recommended for hardening phase one.

Pros:

- Clear security model.
- Prevents accidental storage of incomplete/ambiguous snapshots.
- Keeps "Complete" meaningful.
- Avoids users thinking invalid files were protected.
- Easier restore readiness classification.
- Safer for destructive future restore.

Cons:

- User must remove invalid files and resubmit.
- More friction when many selected files include one bad path.
- Requires good UI feedback for rejected files.

### Option 2: Create Snapshot and Mark Invalid Files as Partial

Pros:

- More tolerant UX.
- Captures valid files even if some selections are invalid.
- Useful for audit-only workflows where partial evidence is acceptable.

Cons:

- Makes security failures look like ordinary missing files.
- Can create misleading "Partial" snapshots.
- Harder to decide future restore eligibility.
- Can hide malicious or accidental path submissions in history.
- Requires more nuanced manifest semantics.

Decision:

Use reject-whole-request for policy violations and invalid input. Reserve `Partial` only for rare race conditions after validation, such as a file being deleted between policy approval and copy. Even then, mark the record with a specific capture warning and make it `Not restorable` unless policy explicitly permits partial restore later.

## 7. Manifest Fields for Eligibility and Policy Version

Add top-level manifest fields:

```ts
policy_version: string
policy_mode: "snapshot-create"
eligibility_summary: {
  approved_files_count: number
  rejected_files_count: number
  warning_count: number
  allowed_roots: string[]
  allowed_extensions: string[]
  max_file_size_bytes: number
  max_files: number
}
manifest_schema_version: 2
restorability: {
  status: "restorable" | "restorable_with_warnings" | "not_restorable"
  reasons: string[]
  evaluated_at: string
  policy_version: string
}
```

Add per-file manifest fields:

```ts
eligibility: {
  policy_version: string
  eligible: boolean
  category: "plugin_source" | "plugin_config"
  reason: string
  warnings: string[]
  normalized_path: string
  realpath_checked: boolean
  symlink: boolean
  size_limit_bytes: number
}
capture: {
  captured_at: string
  source_size_bytes: number
  stored_size_bytes: number
  source_sha256?: string
  stored_sha256: string | null
}
```

Do not store absolute paths in the manifest. Absolute paths can reveal local machine structure and are not portable.

For old manifests, absence of these fields should be treated as `legacy_policy_unknown`.

## 8. Evaluation of Old Snapshots Without Changing Data

Create read-only classifier service:

`apps/medusa-premium-recovery/src/api/admin/premium-recovery/_services/restore-point-classifier.ts`

It should read existing manifests and classify them without writing changes.

### Restorable

A legacy or new snapshot can be considered `Restorable` only if:

- manifest is readable
- required fields exist
- all files are `captured`
- every captured blob exists
- every stored blob hash matches manifest SHA-256
- all file paths pass the current eligibility policy in `restore` mode
- no denied extensions or path parts exist
- no symlink/escape risk is detected
- snapshot was created with current policy version, or legacy evaluation has no warnings

For phase one, legacy snapshots should rarely be `Restorable` unless every path exactly matches the current source/config allowlist.

### Restorable With Warnings

Use this when:

- manifest and blobs are intact
- at least one warning exists, but no hard deny exists
- snapshot lacks current policy fields but all paths pass current allowlist
- schema is legacy but content is source/config only
- metadata such as permission bits is absent

Restore UI must display warnings and require explicit confirmation if future restore supports this class.

### Not Restorable

Use this when:

- manifest is unreadable or malformed
- captured blob is missing
- blob hash mismatch exists
- any file is `missing`
- any path violates current policy
- any archive, secret, database, log, generated artifact, or binary file exists
- any path escapes workspace or cannot be safely resolved
- policy version is unknown and current policy cannot classify it safely

Important: this classification must be computed at read time and returned in API summaries. Do not mutate old manifests.

Recommended API summary fields:

```ts
restorability_status
restorability_reasons
restorability_warnings
policy_version_evaluated
legacy_policy
```

## 9. Required Tests

### Unit Tests

Policy module:

- accepts allowed plugin `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`, `.scss`
- accepts explicit plugin `package.json`
- accepts explicit plugin `tsconfig.json`
- rejects empty path
- rejects duplicate normalized path
- rejects absolute path
- rejects `../` traversal
- rejects path outside workspace
- rejects `node_modules`
- rejects `.git`
- rejects `.premium-recovery`
- rejects `dist`, `build`, `coverage`
- rejects `logs`
- rejects `.env`, `.env.local`, secret/key/cert patterns
- rejects archives
- rejects database extensions
- rejects binary/media/font extensions
- rejects markdown/docs in phase one
- rejects deleted Git status
- rejects directory
- rejects missing file
- rejects symlink
- rejects symlink whose realpath escapes workspace
- rejects files above size limit
- returns stable `policy_version`
- returns deterministic rejection `code` and `reason`

Manifest creation:

- top-level policy fields are present
- per-file eligibility fields are present
- absolute paths are not serialized
- schema version is written
- hash includes policy fields

Classifier:

- classifies valid current-policy snapshot as `Restorable`
- classifies legacy source-only snapshot as `Restorable with warnings`
- classifies legacy archive/log/secret snapshot as `Not restorable`
- classifies missing blob as `Not restorable`
- classifies hash mismatch as `Not restorable`
- classifies partial/missing manifest entries as `Not restorable`

### Integration Tests

Backend route tests:

- `GET /admin/premium-recovery/git-changes` returns only policy-approved paths.
- `POST /admin/premium-recovery/restore-points` rejects invalid mixed file list.
- `POST /restore-points` creates snapshot when all files are eligible.
- manifest includes policy version and eligibility metadata.
- invalid file does not create restore-point directory or manifest.
- duplicate files are rejected.
- deleted/missing file is rejected before snapshot creation.
- large file is rejected.
- route response contains rejected-file details.

Admin integration:

- UI displays only backend-approved files.
- UI does not apply conflicting security filter.
- rejected create response can be displayed as file-level error.
- status/details panel can show policy version and restorable class after later UI work.

### Security Tests

Path attacks:

- `../package.json`
- `apps/medusa-premium-recovery/src/../../backend/.env`
- Windows absolute path like `C:\Users\...\secret`
- POSIX absolute path like `/etc/passwd`
- UNC path like `\\server\share\file`
- mixed slash traversal
- URL-encoded traversal if decoded before route processing
- NUL byte path

Symlink attacks:

- symlink inside allowed root pointing outside workspace
- symlink inside allowed root pointing to `.env`
- symlink loop
- replaced file between validation and copy

Content/size attacks:

- oversized source file
- binary file renamed with `.ts`
- archive renamed with `.json`
- file changes after hash validation but before copy

Recommended mitigation for renamed binary/archive content:

- Phase one can rely on extension plus size, but a stronger policy should sample content and reject NUL-heavy binary files for source extensions.
- For `.json`, parse validation may be considered if only config JSON should be snapshotted.

## 10. Exact Files Proposed for Creation or Change

Create:

- `apps/medusa-premium-recovery/src/api/admin/premium-recovery/_services/file-eligibility-policy.ts`
- `apps/medusa-premium-recovery/src/api/admin/premium-recovery/_services/restore-point-classifier.ts`
- `apps/medusa-premium-recovery/src/api/admin/premium-recovery/_services/__tests__/file-eligibility-policy.test.ts`
- `apps/medusa-premium-recovery/src/api/admin/premium-recovery/_services/__tests__/restore-point-classifier.test.ts`
- `apps/medusa-premium-recovery/src/api/admin/premium-recovery/restore-points/__tests__/route.test.ts`
- `apps/medusa-premium-recovery/src/api/admin/premium-recovery/git-changes/__tests__/route.test.ts`

Change:

- `apps/medusa-premium-recovery/src/api/admin/premium-recovery/git-changes/route.ts`
  - Remove local policy constants and call central policy.

- `apps/medusa-premium-recovery/src/api/admin/premium-recovery/restore-points/route.ts`
  - Validate all incoming paths with central policy before capture.
  - Reject whole request on policy failure.
  - Include structured rejection details.

- `apps/medusa-premium-recovery/src/api/admin/premium-recovery/_services/snapshot-capture.ts`
  - Accept approved descriptors.
  - Keep last-moment regular-file check.
  - Avoid owning allowlist/denylist logic.

- `apps/medusa-premium-recovery/src/api/admin/premium-recovery/_services/snapshot-manifest.ts`
  - Add schema version, policy version, eligibility summary, and per-file eligibility metadata.
  - Add backwards-compatible read support for legacy manifests.

- `apps/medusa-premium-recovery/src/admin/routes/premium-recovery/types/snapshot-workflow.ts`
  - Add optional policy/restorability fields to frontend types.

- `apps/medusa-premium-recovery/src/admin/routes/premium-recovery/services/git.service.ts`
  - Stop duplicating security policy.
  - Map backend-provided category/reason/warnings only.

- `apps/medusa-premium-recovery/src/admin/routes/premium-recovery/hooks/useGitChanges.ts`
  - Stop duplicating security policy.
  - Trust backend-filtered results.

- `apps/medusa-premium-recovery/src/admin/routes/premium-recovery/hooks/useRestorePoints.ts`
  - Preserve structured rejection response for UI display.

- `apps/medusa-premium-recovery/src/admin/routes/premium-recovery/components/RestoreTimeline.tsx`
  - Later UI step: display policy version and restorability status.
  - Not required for first backend hardening if UI can remain compatible.

Do not change in this hardening phase unless directly required:

- `apps/backend/medusa-config.ts`
- `dev-kernel/**`
- existing `.premium-recovery/restore-points/**`
- existing manifests
- database schema

## Recommended Implementation Sequence

1. Add `file-eligibility-policy.ts` with tests.
2. Refactor `git-changes/route.ts` to use the central policy.
3. Refactor frontend Git services to remove duplicated filters.
4. Refactor `restore-points/route.ts` to validate all submitted files before capture.
5. Refactor `snapshot-capture.ts` to accept approved descriptors.
6. Extend `snapshot-manifest.ts` with schema/policy metadata while preserving legacy reads.
7. Add classifier for old snapshots and expose read-only classification in summaries.
8. Add integration and security tests.
9. Only after tests pass, run build/restart in a separate implementation phase.

## Non-Goals for This Phase

- No restore endpoint implementation.
- No mutation of old manifests.
- No deletion of old snapshots.
- No database migration.
- No build or runtime restart.
- No automatic snapshot creation.

## Final Decisions

- Central policy belongs in backend `_services/file-eligibility-policy.ts`.
- `git-changes`, snapshot creation, and future restore must all call the same policy.
- Snapshot creation should reject the entire request if any selected path violates policy.
- Phase-one allowlist should be plugin source/config only.
- Secrets, archives, logs, databases, generated artifacts, symlinks, absolute paths, traversal paths, and outside-workspace files should be rejected.
- Manifest v2 should include `manifest_schema_version`, `policy_version`, `eligibility_summary`, per-file `eligibility`, and read-time `restorability`.
- Old snapshots should be classified read-only as `Restorable`, `Restorable with warnings`, or `Not restorable`; no old data should be rewritten.

No source code, manifest, snapshot, database, runtime data, build output, or server process was changed while preparing this plan. Only this requested report file was created.
