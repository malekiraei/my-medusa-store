# Premium Recovery Snapshot Audit

Date: 2026-07-12
Mode: read-only technical audit
Reviewed code files: 24

## Executive Summary

The current Premium Recovery Snapshot system is a real file-backed snapshot creator, not only a metadata recorder. When a snapshot is created, the backend copies selected files into `.premium-recovery/restore-points/<id>/files/` and writes a `manifest.json` containing metadata, counts, original relative paths, snapshot blob paths, sizes, and SHA-256 values.

Restore is not implemented. I found no endpoint or service that overwrites files, creates files, deletes files created after a snapshot, performs dry-run, checks conflicts, creates a safety snapshot, rolls back on partial failure, or records restore history.

File eligibility currently has two layers. The UI/API source list is driven by `GET /admin/premium-recovery/git-changes`, which now filters to changed non-deleted plugin source/config files only. The snapshot creation endpoint itself accepts any caller-provided path inside the Git workspace and only blocks workspace escape; it does not re-apply the same extension/path allowlist used by `git-changes`.

Existing stored snapshots include historical captures of unrelated or unsafe categories such as `.zip`, `.md`, `.log`, no-extension files, and other workspace artifacts. Their captured blobs and hashes are internally consistent, but the historical scope is wider than a safe Premium Recovery restore engine should trust.

## Architecture Map

| Component/File | Responsibility | Input | Output | Used by | Evidence |
| --- | --- | --- | --- | --- | --- |
| `apps/medusa-premium-recovery/src/admin/routes/premium-recovery/page.tsx` | Admin route composition and snapshot wizard wiring | hooks for status, Git changes, restore points, bundles | dashboard plus `SnapshotWizard` and `RestoreTimeline` | Medusa Admin route | `PremiumRecoveryPage`, `handleCreateSnapshot`, `fetchSnapshotFiles` |
| `components/SnapshotWizard.tsx` | Modal workflow shell for select/details/review/create | files from `fetchGitFiles`, user metadata | normalized create request through `onCreate` | `page.tsx` | `SnapshotWizard`, `snapshotService.normalizePayload` call |
| `hooks/useSnapshotMachine.ts` | Client-side state machine | `fetchFiles`, `createSnapshot`, UI events | states: loading, selecting, metadata, review, creating, done, error | `SnapshotWizard` | `loadFiles`, `send`, `CREATE`, `SELECT_ALL`, `NEXT` |
| `services/git.service.ts` | Fetch and map snapshot-ready files for wizard | `/admin/premium-recovery/git-changes` | `SnapshotFile[]` | `SnapshotWizard` through `page.tsx` | `fetchGitFilesWithRetry`, `isSnapshotSelectableChange` |
| `hooks/useGitChanges.ts` | Dashboard changed-file count/list | `/admin/premium-recovery/git-changes` | filtered changed files | `page.tsx` | `fetchChanges`, duplicated `isSnapshotSelectableChange` |
| `services/snapshot.service.ts` | Normalize UI form into backend payload | name, description, context, use case, selected paths | `SnapshotCreatePayload` | `SnapshotWizard` | `normalizePayload` |
| `hooks/useRestorePoints.ts` | List and create restore points | `/admin/premium-recovery/restore-points` GET/POST | `RestorePoint[]`, create result | `page.tsx`, `RestoreTimeline` | `fetchPoints`, `createPoint` |
| `components/RestoreTimeline.tsx` | Display, sort, filter, paginate snapshot records | restore point summaries | UI status and details | `page.tsx` | `getRecordStatus`, `getStatusFilterValue` |
| `types/snapshot-workflow.ts` | Frontend snapshot and record contracts | TypeScript declarations | UI type safety | admin components/hooks | `SnapshotFile`, `SnapshotRecord`, `SnapshotFileManifest` |
| `api/admin/premium-recovery/git-changes/route.ts` | Backend changed-file discovery | Git porcelain status | filtered `changes` | `git.service.ts`, `useGitChanges.ts` | `GET`, `getGitChanges`, `isSnapshotSelectableChange` |
| `api/admin/premium-recovery/restore-points/route.ts` | List and create restore points | GET or POST body with name/files | manifest-backed summaries or created point | `useRestorePoints.ts` | `GET`, `POST`, `createRestorePoint` |
| `_services/snapshot-capture.ts` | Normalize paths and copy selected files | Git root, selected paths, files directory | `SnapshotFileManifest[]` | `restore-points/route.ts` | `normalizeSelectedPath`, `captureSnapshotFiles` |
| `_services/snapshot-manifest.ts` | Manifest schema, hashing, read/write, summary | captured file manifest records | `manifest.json`, restore-point summary | `restore-points/route.ts` | `createManifest`, `writeManifest`, `readManifest` |
| `_services/snapshot-storage.ts` | Restore-point storage paths and directory listing | `process.cwd()`, restore point id | storage directories and relative paths | manifest/route services | `getRestorePointsRoot`, `ensureRestorePointFilesDirectory` |
| `_services/git-resolver.ts` | Resolve Git workspace root and run Git commands | cwd/env candidates | Git top-level path, Git command stdout | `git-changes`, `status`, `restore-points` | `resolveGitRoot`, `runGit` |
| `status/route.ts` | Report current protection/Git status | Git status | unprotected recovery status | `useRecoveryStatus.ts` | `GET`, `getGitStatus`, `latest_snapshot: null` |
| `bundles/route.ts` | Bundle list placeholder | none | `{ bundles: [] }` | `useBundles.ts` | `GET` |
| `apps/backend/medusa-config.ts` | Registers plugin in Medusa backend | plugin package name | plugin enabled in backend | Medusa runtime | `plugins: [{ resolve: "medusa-premium-recovery" }]` |
| `dev-kernel/live-loop.js` | Separate development build/watch/git snapshot automation | file changes/completion events | plugin build/restart/Git snapshot automation | dev-kernel only | `buildPlugin`, `gitSnapshotAndPush`; not plugin restore |
| `dev-kernel/core/safety.js` | Dev-kernel change filters | file paths/content | effective-change decisions | `live-loop.js` | `isPluginEffectiveChange`, `isPluginAdminExtensionChange` |
| `dev-kernel/config/paths.js` | Dev-kernel path resolution | env/defaults | backend/plugin/runtime paths | `live-loop.js` | `BACKEND_DIR`, `PLUGIN_DIR`, `RUNTIME_DIR` |

## File Eligibility Matrix

Workspace root resolution:

- `resolveGitRoot()` starts at `process.cwd()`, optional `PREMIUM_RECOVERY_GIT_ROOT`, parent directories, and backend/plugin candidates, then asks Git for `rev-parse --show-toplevel`.
- The file selection UI is fed by `GET /admin/premium-recovery/git-changes`.
- The create endpoint re-validates only that submitted paths resolve inside the Git workspace. It does not require that a file was returned by `git-changes`.
- Directories are accepted at request-validation level but become `missing` because `captureSnapshotFiles()` requires `stat().isFile()`.
- Hidden files are not globally blocked at create time. In `git-changes`, hidden/cache/storage path parts listed below are filtered.
- Binary files are copyable at create time because `copyFile` and `readFile(Buffer)` are used. The `git-changes` endpoint does not return typical binary asset extensions.
- No file size limit and no selected-file count limit were found.
- Absolute paths are resolved through `resolve(workspaceRoot, selectedPath)` and are blocked if outside the workspace.
- Path traversal like `../` is blocked by `isInsideWorkspace()`.
- Symlink target validation is not present; `stat()` follows symlinks. A symlink inside the workspace pointing outside may be capturable.

Current `git-changes` allowlist:

- Allowed plugin source extensions: `.css`, `.js`, `.json`, `.jsx`, `.scss`, `.ts`, `.tsx`
- Allowed config files: `apps/medusa-premium-recovery/package.json`, `apps/medusa-premium-recovery/tsconfig.json`
- Required source prefix for other files: `apps/medusa-premium-recovery/src/`
- Deleted files are excluded.

Current `git-changes` excluded path parts:

`.cache`, `.git`, `.medusa`, `.next`, `.premium-recovery`, `.runtime`, `.turbo`, `build`, `coverage`, `dist`, `logs`, `node_modules`, `restore-points`, `snapshots`, `temp-extract`

| Category/path | Selectable? | Snapshotted? | Reason/rule | Evidence |
| --- | --- | --- | --- | --- |
| `apps/medusa-premium-recovery/src/**/*.ts(x)` changed, non-deleted | Yes | Yes if submitted | Plugin source prefix plus allowed extension | `git-changes/route.ts:isSnapshotSelectableChange`; `snapshot-capture.ts:captureSnapshotFiles` |
| `apps/medusa-premium-recovery/src/**/*.js(x)` changed, non-deleted | Yes | Yes if submitted | Plugin source prefix plus allowed extension | same as above |
| `apps/medusa-premium-recovery/src/**/*.css/scss` changed, non-deleted | Yes | Yes if submitted | Plugin source prefix plus allowed extension | same as above |
| `apps/medusa-premium-recovery/package.json` | Yes | Yes if submitted | Explicit config allowlist | `SNAPSHOT_CONFIG_FILES` |
| `apps/medusa-premium-recovery/tsconfig.json` | Yes | Yes if submitted | Explicit config allowlist | `SNAPSHOT_CONFIG_FILES` |
| Plugin `.md` docs | No through Git list | Yes if manually submitted inside workspace | Not in source extension allowlist; create endpoint lacks same allowlist | `git-changes/route.ts`; `restore-points/route.ts:createRestorePoint` |
| `.zip` archives | No through Git list | Yes if manually submitted inside workspace | Excluded by extension in Git list only; byte copy supports it | existing manifest stats show 35 `.zip` historical entries |
| Deleted files | No through Git list | No real content; manually submitted deleted path becomes missing | `status.includes("D")` false; `stat` catch -> missing | `git-changes/route.ts`; `snapshot-capture.ts:missingFileRecord` |
| Directories | No through Git list | Recorded as missing if manually submitted | `stat().isFile()` required | `snapshot-capture.ts:captureSnapshotFiles` |
| `node_modules` | No through Git list | Yes if manually submitted and inside workspace | excluded only from Git list; create endpoint lacks denylist | `EXCLUDED_SNAPSHOT_PATH_PARTS`; `normalizeSelectedPath` |
| `.git` | No through Git list | Risk if manually submitted as file inside workspace | excluded only from Git list; directories become missing | same as above |
| `dist`, `build`, `coverage` | No through Git list | Yes if manually submitted as file inside workspace | excluded only from Git list | same as above |
| `logs` | No through Git list | Yes if manually submitted as file inside workspace | excluded only from Git list; historical `.log` entries exist | stats: 3 `.log` entries |
| `.env` and secret-like files | Not explicitly protected by create endpoint | Yes if submitted inside workspace | no secret denylist in `restore-points/route.ts` or `snapshot-capture.ts` | `normalizeSelectedPath` only checks workspace |
| Database files | Not explicitly protected by create endpoint | Yes if submitted inside workspace | no DB denylist in create endpoint | same as above |
| Generated artifacts | No through Git list for listed parts | Yes if manually submitted as file inside workspace | denylist not enforced in create endpoint | same as above |
| Path outside workspace | No | No | blocked after `resolve()` and `relative()` check | `snapshot-capture.ts:isInsideWorkspace` |

## Snapshot Storage Format

Storage root:

`<backend cwd>/.premium-recovery/restore-points`

With the current backend cwd, existing data is under:

`apps/backend/.premium-recovery/restore-points`

Per snapshot:

```text
.premium-recovery/
  restore-points/
    <uuid>/
      manifest.json
      files/
        <sha256(original-relative-path)>.<original-extension>
```

Manifest fields:

- `id`
- `hash`
- `name`
- `description`
- `business_context`
- `use_case`
- `created_at`
- `files[]`
- `files_count`
- `captured_files_count`
- `missing_files_count`

Manifest file entry fields:

- `path`: original workspace-relative path
- `status`: `captured` or `missing`
- `snapshot_path`: relative path to copied blob, or `null`
- `size`: copied byte length, or `0`
- `sha256`: SHA-256 of copied blob content, or `null`
- `missing_reason`: reason for missing file, or `null`

Real content is saved for captured files. The implementation uses `copyFile()` followed by `readFile()` as a Buffer and hashes the copied bytes. This preserves binary bytes and text encoding because the content is not serialized as text. Permission metadata, executable bit, mtime, ownership, and original mode are not stored in the manifest.

Missing/deleted/non-file paths are recorded as manifest entries with `status: "missing"`, no blob, size `0`, no SHA-256, and reason `File did not exist at snapshot time`.

Same-basename collisions are avoided because stored blob names are based on `sha256(relativePath)` plus the original extension.

Read-time integrity is not enforced by application code. `readManifest()` parses JSON and returns the summary; it does not recompute the manifest hash or verify each stored blob's SHA-256 before reporting the snapshot.

## Status Semantics

Backend manifest status is per file only:

- `captured`: file existed, was a regular file, was copied, and hash was computed.
- `missing`: file did not exist, was not a regular file, or copy/stat/read failed.

Snapshot-level UI status is computed at display time in `RestoreTimeline.tsx:getRecordStatus()`:

| Status | Exact UI condition | Stored at creation? | Based on |
| --- | --- | --- | --- |
| Complete | `captured_files_count > 0 && missing_files_count === 0` | No | manifest counts or derived manifest file statuses |
| Partial | `captured_files_count > 0 && missing_files_count > 0` | No | manifest counts or derived manifest file statuses |
| Missing | `captured_files_count === 0 && missing_files_count > 0` | No | manifest counts or derived manifest file statuses |
| Empty | otherwise, usually zero captured and zero missing | No | counts |
| Unknown | counts cannot be derived | No | missing count data |
| Failed | Not a backend status. The UI filter maps red status to `failed`, so `Missing` appears under Failed filtering. | No | `getStatusFilterValue()` |

UI and backend do not share one canonical snapshot status field. The backend stores counts; the frontend interprets them. This can display misleading status if counts and `manifest_files` diverge, because no verification is done when reading.

## Existing Snapshot Statistics

Storage audited read-only:

`apps/backend/.premium-recovery/restore-points`

| Metric | Count |
| --- | ---: |
| Restore-point directories | 27 |
| Readable manifests | 27 |
| Unreadable manifests | 0 |
| Incomplete manifests | 0 |
| Complete snapshots | 19 |
| Partial snapshots | 5 |
| Missing snapshots | 3 |
| Empty snapshots | 0 |
| Total selected file entries | 139 |
| Total captured file entries | 106 |
| Total missing file entries | 33 |
| Captured entries missing stored blob | 0 |
| Captured entries missing SHA-256 | 0 |
| Stored blob hash mismatches | 0 |
| Snapshots with missing actual captured blob | 0 |
| Snapshots unreliable due to missing manifest/blob/hash mismatch | 0 by blob/hash check |

Extension distribution in existing manifests:

| Extension/category | Entries |
| --- | ---: |
| `.js` | 41 |
| `.zip` | 35 |
| `.tsx` | 13 |
| no extension | 10 |
| `.json` | 9 |
| `.md` | 7 |
| `.ts` | 5 |
| `.npmrc` | 5 |
| `.bat` | 3 |
| `.runtime` | 3 |
| `.log` | 3 |
| `.gitignore` | 2 |
| `.yaml` | 1 |
| `.agents` | 1 |
| `.txt` | 1 |

Interpretation: current stored data is internally consistent, but historical snapshots include many entries outside the current safe source/config allowlist. They should not automatically be treated as safe restore candidates.

## Restore Readiness

Result: Not implemented.

Findings:

- No real restore endpoint was found.
- No preview/dry-run endpoint was found.
- No overwrite operation was found in plugin restore code.
- No logic creates files from snapshot blobs.
- No logic deletes files created after snapshot time.
- No safety snapshot is created before restore.
- No conflict detection was found.
- No current-file hash comparison was found.
- No atomic restore transaction or staged temp-write/rename flow was found.
- No rollback strategy was found.
- No restore audit/history record was found.
- No restore authorization layer beyond normal Medusa admin route access was found.
- No restore-time path validation exists because restore itself does not exist.
- No policy exists for allowing/blocking restore from Partial or Missing snapshots.

The `bundles` route returns an empty array, and `status` reports `latest_snapshot: null`, `bundle_count: 0`, and `last_successful_restore: null`. `BundleList` contains UI affordances for bundle metadata but no real restore action path.

Missing data/components for safe restore:

- canonical restore endpoint with explicit request schema
- server-side restore eligibility policy matching snapshot allowlist
- manifest and blob integrity verification before restore
- current workspace hash comparison and conflict report
- dry-run response
- backup/safety snapshot before write
- atomic write strategy
- rollback/failure journal
- restore audit record
- authorization policy for destructive recovery actions
- handling policy for missing/deleted files and Partial snapshots
- protection against symlink traversal via realpath checks

## Risks and Gaps

Critical:

- Restore is absent, so the product may imply recovery capability that it does not currently provide.
- Create endpoint does not enforce the same allowlist as `git-changes`; a caller can submit unrelated workspace files, including secrets or generated artifacts, as long as they are inside the Git workspace.
- Symlink target validation is missing; workspace-contained symlinks may allow copying content from outside the intended workspace.

High:

- No read-time integrity verification; manifest hash and blob hashes are stored but not validated when listing/using restore points.
- No restore-time design exists for conflict detection, rollback, atomic writes, or safety snapshots.
- Historical restore points include `.zip`, `.md`, `.log`, no-extension, and other entries outside the intended plugin source scope.
- UI status is computed independently from backend counts and may be misleading if manifest counts or files are stale.

Medium:

- No file size limit or file count limit was found.
- No permission/executable metadata is recorded, limiting faithful restore.
- Missing/deleted files are recorded only as missing entries; there is no deletion restore policy.
- `status` endpoint does not use the latest restore point and always reports `latest_snapshot: null`.
- Git eligibility logic is duplicated in backend route and frontend services/hooks, increasing drift risk.

Low:

- Bundle UI and route are placeholders, which can confuse users but do not perform unsafe operations.
- Manifest schema has no explicit version field, making future migrations harder.
- Directory selections become missing instead of being rejected earlier with a clear validation message.

## Options A/B/C

### Option A: Minimal Safe Restore

Work required:

- Add restore endpoint with dry-run first.
- Re-validate manifest, blob hashes, and paths before any write.
- Enforce the same source/config allowlist at create and restore time.
- Block symlink escapes using realpath checks.
- Create safety snapshot before restore.
- Restore only captured files from Complete snapshots initially.
- Add audit record and clear UI messaging.

Risk: Medium if scoped to Complete snapshots and plugin source/config files only.

Complexity: Medium.

Fit for current project: Best first implementation path.

### Option B: Full Recovery Engine

Work required:

- Everything in Option A.
- Support Partial snapshots with policy controls.
- Support deleting files created after snapshot.
- Support restoring missing/deleted file state.
- Add conflict-resolution UI.
- Add atomic staged writes and rollback journal.
- Add manifest schema versioning and migration.
- Add bundle export/import verification.

Risk: High.

Complexity: High.

Fit for current project: Premature until minimal restore and policy boundaries are proven.

### Option C: Snapshot/Audit Only

Work required:

- Rename UX and copy so it does not imply restore.
- Keep file-backed capture and manifest audit trail.
- Remove/disable restore and bundle affordances.
- Strengthen file eligibility and integrity checks for audit reliability.

Risk: Low.

Complexity: Low.

Fit for current project: Safe if recovery is intentionally deferred.

## Final Recommendation

Direct answers:

1. The current snapshot system really keeps copies of captured file contents, not just metadata/hash/path.
2. Through the normal UI source list, snapshots can currently be selected from changed non-deleted `apps/medusa-premium-recovery/src/**` files with `.css`, `.js`, `.json`, `.jsx`, `.scss`, `.ts`, `.tsx`, plus plugin `package.json` and `tsconfig.json`. Through direct POST, any regular file inside the Git workspace can still be snapshotted.
3. Existing snapshots are internally consistent by manifest/blob/hash checks, but not broadly trustworthy for restore because historical records include unrelated categories and there is no restore policy.
4. Real restore does not exist.
5. The smallest safe phase-one path is Option A: implement minimal dry-run-first restore for Complete snapshots only, enforce one shared server-side eligibility policy, verify integrity, create a safety snapshot, and write an audit record.

No source, runtime, database, build output, or stored restore-point data was modified during this audit. Only this requested report file was created.
