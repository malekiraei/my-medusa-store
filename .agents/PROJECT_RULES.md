# Premium Recovery Project Rules

This file is the persistent operating guide for Premium Recovery work in this repository.

## 1. Medusa Skills First

- Before any Medusa-related planning, audit, implementation, or debugging, read the relevant Medusa skills under `.agents/skills/`.
- For Admin UI work, read `.agents/skills/building-admin-dashboard-customizations/SKILL.md` and the relevant references:
  - `references/data-loading.md` for API/data loading.
  - `references/display-patterns.md` for lists, tables, and display surfaces.
  - `references/forms.md` for modals, drawers, and forms.
  - `references/table-selection.md` for large selection flows.
  - `references/navigation.md` for routing.
  - `references/typography.md` for text and visual hierarchy.
- For storefront work, read `.agents/skills/building-storefronts/SKILL.md` and `references/frontend-integration.md`.
- Skills are primary planning sources. Official docs may be used as secondary verification when needed.

## 2. Truthful UI And No Fake Data

- Do not display fake data, fake restore points, fake bundles, fake activity, fake history, fake success, fake health, fake risk, fake confidence, fake recommendations, or fake protection.
- UI text must describe the capability that actually exists today.
- Avoid unsupported wording such as:
  - rollback available
  - full recovery
  - guaranteed restore
  - protected
  - recovery ready
  - restore available
  - bundle available
  - risk score
  - health score
  - confidence
  - prediction
- If Git, storage, backend support, or database access is unavailable, show that truth explicitly.
- A successful action may only be shown when a real backend operation succeeded.

## 3. Library First And Reuse Before Rebuild

- Before creating new UI, search for existing components, hooks, services, adapters, and types.
- Reuse or safely adapt existing components when they match the job.
- Do not create duplicate surfaces for the same concept unless explicitly approved.
- Existing inactive or future components must be audited before reuse, especially if they imply unsupported capabilities.
- If a new file seems necessary, stop and report:
  - why reuse is impossible
  - expected architecture impact
  - files that would be added
  - fake-data or duplicate-source risk

## 4. No New File Without Pre-Check

- Search first with `rg` or `rg --files`.
- Identify existing source-of-truth files before adding anything.
- Do not create placeholder UI, placeholder routes, placeholder data, or placeholder services.
- Do not add new abstractions unless they remove real complexity or match an established local pattern.

## 5. No Duplicate Source Of Truth

- Snapshot data must flow from the backend manifest/storage contract.
- Counts and lists must use the same real data source.
- Dashboard cards, timelines, details, and future views must not each invent their own interpretation of backend state.
- Derived labels may be rendered in UI, but stored facts must come from backend contracts or explicit deterministic analyzers.

## 6. Protected Dashboard Baseline

- The current dashboard composition is protected unless a task explicitly allows changes.
- Do not casually alter:
  - page hero/header composition
  - `DashboardCards`
  - `RecoveryOverview`
  - metric cards
  - chart logic
  - major spacing/layout structure
- Visual polish must come after backend contracts and truthful data behavior are stable.

## 7. Snapshot Domain Architecture

The current Snapshot Domain is a truthful file-backed snapshot capture platform.

Current capabilities:
- real Git change detection
- selected file capture
- filesystem-backed restore point directories
- manifest generation
- file size and sha256 capture
- missing/deleted file recording
- read-only snapshot timeline
- read-only manifest details

Snapshot architecture must remain layered:

```text
UI
-> hooks
-> services/adapters
-> backend contracts
-> filesystem/storage
```

Rules:
- Do not read filesystem data directly from frontend code.
- Do not bypass hooks/services/adapters for new UI behavior.
- Backend APIs must expose real stored data.
- File snapshot logic belongs to the Snapshot Domain, not Database Backup or Bundle logic.

## 8. Future Database Backup Domain Separation

Database Backup is a future product domain and must remain separate from the current Snapshot Wizard.

It must have its own:
- backend contract
- service
- hook
- UI surface
- backup engine
- storage path and manifest format

Future Database Backup architecture:

```text
UI
-> hooks
-> services/adapters
-> backend contracts
-> database backup engine
-> storage
```

Possible future endpoints, documentation only:

```text
GET    /admin/premium-recovery/database-backups
POST   /admin/premium-recovery/database-backups
GET    /admin/premium-recovery/database-backups/:id
DELETE /admin/premium-recovery/database-backups/:id

Later:
POST   /admin/premium-recovery/database-backups/:id/restore
```

Do not add Database Backup UI, cards, routes, or placeholder data until real backend support exists.

## 9. Build And Backend Restart Rules

- Audit-only tasks must not build or restart unless the user explicitly asks.
- Implementation tasks should run `npm run build` after changes unless the user says not to.
- Restart backend only when needed, usually after backend route changes, compiled admin extension changes, or when the user requests it.
- Report build result clearly.
- Report backend status as:
  - running on port 9000
  - failed
  - not restarted because not needed
- Do not leave required dev server sessions half-started without checking status.

## Runtime Verification After Code Changes

- After any implementation that changes source code, run:
  `npm run build`
- If build fails:
  - stop
  - do not restart backend
  - report the build error
- If build succeeds, run:
  `npx medusa plugin:build`
- Then restart Medusa backend dev server.
- Ensure backend is running on port 9000.
- Verify:
  - `http://localhost:9000/app`
  - `http://localhost:9000/app/premium-recovery`
- Final report must include:
  - changed files
  - build result
  - plugin build result
  - backend status
  - port 9000 status
  - browser readiness
  - fake data added: yes/no
  - architecture preserved: yes/no
  - scope preserved: yes/no
- For audit-only tasks:
  - do not change code
  - do not restart backend
  - build only if explicitly requested
- For Undo/Redo or rollback that changes files:
  - treat it like a code-changing task
  - run the same build/plugin-build/backend verification sequence

## 10. Audit-Only Rules

When the user says audit-only, do not modify code, build, or restart.

Audit reports should include:
- files inspected
- active/inactive/legacy/orphan status
- contracts and response shapes
- first failure point when tracing runtime paths
- risks and mismatches
- exact recommended implementation sequence

## 11. Scope Control Rules

- Respect allowed/protected file lists exactly.
- Do not touch protected files.
- Do not broaden a bug fix into visual polish, refactor, or feature work.
- If the safe fix requires touching a file outside approved scope, stop and report why.
- Keep changes minimal and directly connected to the approved task.
- Do not implement restore/delete/download/compare/bundle/database features unless explicitly requested and backed by real contracts.

## 12. Backup Rules

- When requested, create the named ZIP backup before editing files.
- Include only files that will be edited, plus optional files explicitly allowed by the task.
- Report the backup path in the final response.
- Do not include generated recovery data unless explicitly asked.

## 13. Smart Feature Rules

No fake intelligence.

Before implementing any smart Snapshot feature, report:
1. What real data supports the feature?
2. Is the logic deterministic or inferred?
3. Could the UI overclaim?
4. Where should the logic live?
5. Does an existing helper/component already exist?
6. What fake-data risk exists?
7. What is the minimal truthful version?

Allowed smart behavior only when based on real data, explicit rules, or verifiable analysis:
- classify files by path/type
- detect configuration files
- detect environment files
- detect source/admin/backend/frontend files
- highlight missing captured files
- warn if snapshot includes large files
- warn if selected files include `.env`
- warn if deleted files cannot be captured
- recommend reviewing critical config files based on explicit rule lists

Not allowed:
- AI risk scores without evidence
- fake impact ranking
- fake protection health
- fake restore confidence
- fake backup health
- fake database coverage

Smart logic must live in explicit analyzers, deterministic helpers, backend metadata, or named services. Do not bury it inside visual components.

## 14. Product Roadmap

Premium Recovery should evolve from a developer-focused snapshot tool into a broader recovery platform for:
- developers
- technical store operators
- ecommerce store owners/admins

### Phase 1 - Stabilized Snapshot Capture

Achieved:
- real file-backed snapshots
- manifest records
- truthful dashboard display

### Phase 2 - Snapshot Inspection

Next suitable direction:
- manifest detail refinement
- captured/missing file grouping
- file type grouping
- path-based filtering/search
- copy path/hash
- no restore yet

### Phase 3 - Snapshot Operations

Only after backend support:
- delete snapshot
- download manifest
- export snapshot archive
- verify snapshot integrity by recomputing sha256

### Phase 4 - Smart But Truthful Assistance

Only deterministic, evidence-backed analysis:
- file classification
- config/environment/source detection
- large file warnings
- deleted/missing file warnings
- explicit rule-based recommendations

### Phase 5 - Restore / Apply

Future major feature:
- restore selected captured files
- dry-run restore preview
- conflict detection
- overwrite confirmation
- backup-before-restore
- restore audit record

### Phase 6 - Enterprise Recovery

Future advanced layer:
- database backup domain
- bundle generation
- diff/compare
- restore policies
- retention rules
- scheduled backup
- multi-snapshot search
- database/application state support
- role-based access if needed

## 15. Product Domains

### Snapshot Domain

- file-backed snapshots
- manifest
- verification
- future restore/apply

### Database Backup Domain

- database dump/export
- backup metadata
- backup verification
- retention rules
- future restore/import

Future database backup may include:
- database engine detection
- connection verification
- dump creation
- backup file storage
- backup manifest
- table counts if safely available
- backup size
- checksum/hash
- created_at
- status: completed / failed / partial

Do not show fake backup health, fake success, fake restore readiness, fake coverage, or fake protection score.

### Store Recovery Domain

- restore selected files
- restore database backup
- dry-run restore
- conflict detection
- backup-before-restore

### Bundle Domain

- combine file snapshot and database backup
- exportable recovery package
- future cloud/offsite storage
- no bundle claims until real bundle generation exists

### Analyzer Domain

- deterministic inspection
- file classification
- database table coverage when safely available
- missing file warnings
- large backup warnings
- no fake AI scores

### Policy Domain

- retention
- scheduled backup
- backup frequency
- storage limits
- admin permissions

## 16. Target User Value

Developer-focused value:
- protect code changes
- inspect file snapshots
- restore selected files later

Technical operator value:
- verify what was captured
- inspect manifests and hashes
- manage retention and backup operations later

Store owner/admin value:
- backup store data
- protect products, orders, customers, settings
- simple recovery timeline
- clear backup status
- understandable restore readiness only when real restore support exists
