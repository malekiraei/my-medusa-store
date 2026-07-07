<!-- README.md -->

# Codex Premium Dashboard Project Specification v2.2 — Kernel-Compatible / Performance-Optimized

Use this package inside VS Code/Codex for the Medusa Premium Recovery plugin.

## Recommended VS Code Folder

Open the workspace root:

`C:\Users\H.M\my-medusa-store`

Do not open only the plugin folder unless the task is strictly limited to one file.

## Codex Start Order

1. Read `PROJECT.md`
2. Read `00_HARD_RULES.md`
3. Read `01_ARCHITECTURE_MAP.md`
4. Read `02_RECOVERY_PROTOCOL.md`
5. Inspect according to `03_AUDIT_COMMANDS.md` without running build/backend/restart commands
6. Choose the smallest complete solution, not the smallest patch.

## Kernel Rule

The automatic Kernel manages build, backend, restart, Snapshot, Git Backup, Continue Index, Code Map, and health logging.

Codex should edit code, improve the plugin, and report what changed. Codex should not duplicate Kernel-owned operations.

## Performance Rule

Codex is allowed to make targeted refactors, create related files, and improve architecture when those changes directly support the requested task, reduce complexity, remove duplication, or make the plugin easier to maintain.

Avoid broad, unrelated rewrites.

## Included Assets

The previous v1 specification and originally uploaded instruction ZIPs are included under `assets/`.


<!-- PROJECT.md -->

# PROJECT.md — Premium Recovery Plugin Codex Operating Context

## Workspace

Root workspace:

`C:\Users\H.M\my-medusa-store`

Plugin:

`apps\medusa-premium-recovery`

Backend:

`apps\backend`

## Primary Goal

Recover and then upgrade the Premium Recovery plugin dashboard.

The final dashboard must be:

- compatible with Medusa Admin,
- visually premium,
- stable according to Kernel build results,
- based on real installed packages,
- built through vendor/adapter abstraction,
- not based on fake exports, placeholder UI, or guessed libraries.

## Automatic Development Kernel

The workspace has an automatic Kernel that handles:

- initial plugin build,
- backend `medusa develop`,
- smart effective-change detection,
- plugin rebuild after real changes,
- backend restart only when needed,
- Snapshot and Git Backup after at least 5 real changes,
- Continue Index and Code Map update,
- health/event logging.

Codex must not duplicate these infrastructure tasks unless explicitly requested.

## Current Development Rule

If Kernel logs show the site/plugin does not build, prioritize targeted recovery first.

Do not start unrelated visual redesign while broken. However, Codex may create or restructure files when that is the cleanest direct fix for the current error or requested feature.

## User Preference

The user prefers action over long explanations.

Codex should:

- inspect first,
- make a complete targeted change instead of a fragile patch,
- use targeted refactoring when it directly improves the current task,
- create related files/components/adapters when they reduce complexity or match project architecture,
- let Kernel handle build/restart/backup/index automatically,
- report exact changed files, purpose, and expected Kernel action,
- avoid broad unrelated rewrites.


<!-- 00_HARD_RULES.md -->

# 00_HARD_RULES.md — Kernel-Compatible Authority Rules

## 1. Kernel Owns Runtime Operations

The workspace uses an automatic development Kernel.

Codex must NOT manually run or trigger these operations unless the user explicitly requests it:

- plugin build
- backend startup
- backend restart
- snapshot creation
- Git backup or commit
- Continue Index update
- Code Map regeneration
- `.medusa` cleanup
- health-check loops

## 2. Codex Owns Code Quality

Codex's role is coding, recovery, feature implementation, plugin improvement, and targeted technical cleanup.

Prefer the smallest complete solution, not the smallest patch.

Codex may refactor code directly related to the current task when it:

- solves the requested task more cleanly,
- reduces complexity,
- removes duplicated code,
- improves maintainability,
- improves type safety,
- aligns files with the existing architecture,
- or is necessary for the requested feature.

Avoid broad architectural rewrites or unrelated refactors outside the affected feature unless explicitly requested.

## 3. Broken State Rule

If Kernel logs or user-provided output show a build/import/runtime error, prioritize the first relevant error.

Allowed while broken:

- fix imports/exports/types,
- create a missing file if the missing file is part of the intended architecture,
- move duplicated logic into a small helper if it directly fixes the error,
- adjust vendor/adapters when they are the direct source of the error,
- revert accidental changes.

Not allowed while broken:

- unrelated redesign,
- dependency installation without approval,
- whole-module rewrite unrelated to the first error,
- guessing APIs that are not verified.

## 4. No Fake Imports

Do not use any package, symbol, export, alias, route, API, or Medusa extension point unless verified in:

- package.json
- package-lock.json
- vendor files
- installed dependency tree
- existing source files
- official project-local patterns

## 5. New Files Are Allowed When Justified

Codex may create new files when they are directly related to the current task and improve structure, such as:

- a focused component,
- adapter,
- utility,
- vendor wrapper,
- type definition,
- test/spec fixture,
- or route-local helper.

Do not create files just to hide errors, duplicate unresolved logic, or bypass the existing architecture.

## 6. No Dependency Assumptions

Before using any of these, verify they are installed and compatible:

- clsx
- recharts
- lucide-react
- @mantine/core
- @medusajs/ui
- @medusajs/icons

If a dependency is missing, prefer an existing installed alternative or ask before adding it.

## 7. Vendor Contract First

Feature components should not import third-party UI dependencies directly unless the existing project already does so consistently.

Preferred route:

`feature component -> src/ui/vendor/* -> real installed library`

Codex may improve the vendor layer when doing so clarifies ownership and removes repeated dependency checks.

## 8. Existing Architecture Wins, But Can Be Improved Locally

Do not impose a new architecture before mapping the current one.

After mapping, Codex may improve the local architecture of the affected feature if the change is directly useful and does not break public entry points.

## 9. Stop Expanding on First New Error

If a new error appears in Kernel logs or user-provided output, stop expanding scope and fix that error first.

This does not prohibit targeted refactoring that is necessary to fix the error cleanly.

## 10. No Placeholder Downgrade

Do not replace charts/cards/tables with placeholder text unless the user explicitly requests emergency safe mode.

Prefer graceful loading, empty, and error states that keep the premium dashboard structure intact.

## 11. Report Precisely

Every response after editing must include:

- files changed
- purpose of change
- important design/refactor choices
- whether Kernel should handle build/restart automatically
- next recommended action

Do not report manual build/restart/backup commands unless explicitly requested.


<!-- 01_ARCHITECTURE_MAP.md -->

# 01_ARCHITECTURE_MAP.md

## Workspace Structure

Expected structure:

```txt
my-medusa-store/
  apps/
    backend/
    medusa-premium-recovery/
```

## Plugin Areas

Expected plugin areas:

```txt
apps/medusa-premium-recovery/
  package.json
  src/
    admin/
      index.ts
      routes/
        premium-recovery/
          page.tsx
          components/
            DashboardCards.tsx
    ui/
      adapters/
      components/
      vendor/
```

## Core Layers

### 1. Admin Route Layer

Responsible for Medusa admin pages.

Files may include:

- `src/admin/index.ts`
- `src/admin/routes/premium-recovery/page.tsx`
- route-level dashboard components

### 2. Feature UI Layer

Dashboard-specific UI.

Example:

- `DashboardCards.tsx`
- system health cards
- operation tables
- recovery trend components

### 3. UI Components Layer

Reusable plugin components.

Example:

- metric cards
- grids
- trends
- badges
- chart cards

### 4. Adapters Layer

Maps domain/plugin status into UI presentation descriptors.

Example:

- `src/ui/adapters/status.ts`

### 5. Vendor Layer

Boundary around installed libraries.

Example:

- `src/ui/vendor/index.ts`
- `src/ui/vendor/medusa.ts`
- `src/ui/vendor/mantine.ts`
- `src/ui/vendor/charts.ts`
- `src/ui/vendor/lucide.ts`

Vendor must only re-export real installed symbols.

## Architecture Improvement Rule

Existing architecture is the starting point.

Codex may improve local architecture when the change is directly related to the task, such as splitting an oversized route component, extracting a reusable card/table/modal, or moving repeated presentation mapping into an adapter.

Do not change public package/plugin entry points or cross-app architecture without explicit instruction.

## Known Risk Area

Duplicate files such as:

```txt
src/ui/components/PRMetricCard.tsx
src/ui/components/metric/PRMetricCard.tsx
```

must be audited before deletion. Do not remove while build is broken unless that file is the direct source of the error and the import graph is known.

After build is green, Codex may consolidate duplicates when all imports are mapped and compatibility is preserved.


<!-- 02_RECOVERY_PROTOCOL.md -->

# 02_RECOVERY_PROTOCOL.md — Kernel-Compatible Recovery Protocol

## Operating Principle

The automatic development Kernel owns build, backend startup, smart rebuild, backend restart, snapshot, Git backup, Continue Index, Code Map, and health/event logging.

Codex recovers and improves code by reading Kernel output or user-provided logs, then making targeted complete edits. Codex must not run runtime-management commands unless explicitly requested.

## Step 1 — Read the Current Error Source

Use the latest Kernel log, terminal output, browser error, or user-provided error text.

Do not start by running `npm run build` or `medusa develop`.

## Step 2 — Classify the First Relevant Error

### Missing dependency

Example:

```txt
Cannot find module 'clsx'
```

Action:
- inspect `package.json` and `package-lock.json`
- do not install packages unless the user explicitly approves
- use an existing installed alternative if suitable
- export through vendor only after the dependency is confirmed installed

### Missing vendor export

Example:

```txt
Module "../vendor" has no exported member "MantineBadge"
```

Action:
- inspect `src/ui/vendor/index.ts`
- inspect the relevant vendor submodule
- add only a real export, or change the consumer to an existing export
- if multiple consumers repeat the same workaround, create a small vendor/helper abstraction

### Wrong icon props

Example:

```txt
Property 'level' does not exist on LucideProps
```

Action:
- identify wrong component resolution
- do not pass UI props to SVG icon
- use correct UI component or existing status wrapper
- centralize icon/status mapping when it reduces repeated mistakes

### Admin entry resolution failure

Example:

```txt
Failed to resolve import "medusa-premium-recovery/admin"
```

Action:
- confirm plugin admin entry files exist
- confirm package name and exports
- fix source/package configuration only
- do not clean backend `.medusa`, rebuild plugin, or restart backend unless the user explicitly requests it

## Step 3 — Make a Complete Targeted Fix

Prefer a clean local fix over a fragile patch.

Allowed when directly related:

- add a missing type/helper/component file,
- consolidate duplicate logic used by the affected feature,
- improve adapter/vendor boundaries,
- rename local symbols for clarity,
- remove dead code that is proven unused by the affected import graph.

Avoid unrelated redesign or broad architecture changes.

## Step 4 — Cache/Lock Issues

If the error appears to require `.medusa` cleanup, node process termination, or cache reset, do not execute it directly.

Report the exact suspected cache/lock issue and ask the user to allow a manual infrastructure action, unless the user has already explicitly requested such action.

## Step 5 — Recovery Exit Condition

Recovery is complete when the Kernel reports or the user confirms:

- plugin build succeeds
- backend admin resolves plugin admin extension
- no Vite import-analysis error remains
- no TypeScript import/export error remains
- no missing module error remains

## Step 6 — After Edit Behavior

After code edits, stop and let the Kernel handle rebuild/restart automatically.

Report:

- files changed
- purpose of change
- targeted refactor/design choice if any
- expected Kernel action
- next recommended action


<!-- 03_AUDIT_COMMANDS.md -->

# 03_AUDIT_COMMANDS.md — Kernel-Compatible Audit Checklist

Codex should inspect files before meaningful changes.

Do not run build, backend, restart, snapshot, Git backup, Continue Index, or Code Map commands unless the user explicitly requests them.

## Inspect package metadata

Open and inspect:

```txt
package.json
package-lock.json
apps/medusa-premium-recovery/package.json
apps/backend/package.json
```

## Inspect vendor files

Open and inspect:

```txt
src/ui/vendor/index.ts
src/ui/vendor/medusa.ts
src/ui/vendor/mantine.ts
src/ui/vendor/charts.ts
src/ui/vendor/lucide.ts
```

## Inspect recovery/dashboard files

Open and inspect:

```txt
src/ui/adapters/status.ts
src/admin/routes/premium-recovery/page.tsx
src/admin/routes/premium-recovery/components/DashboardCards.tsx
```

## Optional read-only checks

Read-only commands may be used when needed and only if they do not start build/backend/restart/backup processes.

Examples:

```bash
node -p "require('./package.json').name"
npm pkg get name version dependencies devDependencies peerDependencies
```

Codex may also use read-only search/list commands to map imports and ownership, for example:

```bash
rg "DashboardCards|PRMetricCard|from .*vendor" apps/medusa-premium-recovery/src
find apps/medusa-premium-recovery/src -maxdepth 4 -type f
```

## Required Audit Output

Before editing, Codex should summarize briefly:

```txt
Observed error/source:
Relevant installed/package metadata:
Vendor exports inspected:
Files causing current issue:
Complete targeted fix plan:
Kernel-managed operations to avoid:
```

The plan may include targeted refactoring or new files if directly justified by the task.


<!-- 04_DEPENDENCY_GRAPH.md -->

# 04_DEPENDENCY_GRAPH.md

## Dependency Categories

### Medusa Native

Preferred for Medusa admin compatibility:

- `@medusajs/ui`
- `@medusajs/icons`

### Utility

Allowed if installed and declared:

- `clsx`

Use case:

- conditional className composition
- card variants
- badge variants
- active/disabled states
- responsive classes

### Charts

Allowed if installed and vendor-wrapped:

- `recharts`

Use case:

- trend charts
- donut/pie status charts
- recovery activity charts

### Optional Icons

Allowed only after audit:

- `lucide-react`

Use only through vendor/icon abstraction.

### Optional UI Toolkit

Allowed only after audit:

- `@mantine/core`

Use only if installed and already accepted by project architecture.

## Dependency Rule

Do not introduce package imports directly into feature components without verifying project policy.

Preferred:

```txt
component -> ui/vendor -> package
```

## clsx Policy

If `clsx` is installed and package.json includes it, the vendor index may export:

```ts
export { default as clsx } from "clsx"
```

Do not add this if `clsx` is missing.


<!-- 05_VENDOR_CONTRACT.md -->

# 05_VENDOR_CONTRACT.md

## Purpose

Vendor files are not design-system components.

They are compatibility boundaries.

## Rules

- Export only real installed symbols.
- Do not define fake components.
- Do not rename symbols unless alias points to a real export.
- Do not mix unrelated responsibilities.

## Recommended Index

Keep the index simple:

```ts
export * from "./medusa"
export * from "./lucide"
export * from "./charts"
export * from "./mantine"
```

If `clsx` is installed:

```ts
export { default as clsx } from "clsx"
```

## Alias Rule

Aliases such as:

```ts
export { Badge as MantineBadge }
```

are only allowed inside the correct vendor submodule if:

- `@mantine/core` is installed,
- `Badge` exists,
- consumer files actually require that alias.

Prefer changing consumers to official names over creating excessive aliases.

## Error Handling

If consumer imports a missing symbol:

1. Find the consumer file.
2. Find the intended source.
3. Verify package/export exists.
4. Add real vendor export or update consumer.
5. Build.


<!-- 06_DESIGN_TOKEN_SPEC.md -->

# 06_DESIGN_TOKEN_SPEC.md

## Goal

Create a premium identity without breaking Medusa Admin visual compatibility.

## Spacing Scale

Use 8px base rhythm:

```txt
4  micro
8  small
12 compact
16 normal
24 section
32 large
```

## Radius

```txt
8px  badges/buttons
12px compact cards
16px premium cards/modals
```

## Shadows

Keep subtle:

- card default: soft border/elevation
- hover: slightly stronger elevation
- modal: stronger but calm

## Semantic Colors

Use restrained semantic tones:

- success: green
- warning: amber/orange
- critical: red
- info: blue
- neutral: gray/slate

Use Medusa tokens where possible.

## Typography

- metric values: strong and readable
- labels: muted and compact
- section titles: clear but not oversized
- table text: dense and readable

## Visual Signature

The plugin should feel like Medusa plus a premium recovery-specific signature:

- refined cards
- clean data visualization
- consistent icon containers
- elegant status badges
- high-quality empty/loading states


<!-- 07_COMPONENT_TREE.md -->

# 07_COMPONENT_TREE.md

## Expected Component Hierarchy

```txt
Admin page
  Page header
  Dashboard summary
    Metric grid
      Metric card
      Metric trend
  System health
    health card
    chart card
  Recovery activity
    operations table
    status badges
  Modals/dialogs
    confirmation modal
    restore modal
```

## Component Ownership

### Route-level files

May compose sections but should not own reusable visual primitives.

### `ui/components/metric`

Owns metric cards, grids, and trends.

### `ui/adapters`

Owns data-to-presentation mapping.

### `ui/vendor`

Owns third-party export boundaries only.

## Duplicate Rule

If two components have the same name in different paths:

1. map imports first,
2. determine which is active,
3. keep compatibility until build is green,
4. consolidate only after build is green.


<!-- 08_FILE_OWNERSHIP_RULES.md -->

# 08_FILE_OWNERSHIP_RULES.md

## Purposeful Editing

Every edit must have a purpose:

- recover build,
- implement the requested feature,
- normalize vendor boundaries,
- improve a known component,
- remove duplication in the affected area,
- polish UI after build is green.

## While Broken

Allowed edits:

- fix bad imports,
- fix missing real exports,
- fix incompatible types,
- fix package declaration mismatch,
- create a missing file that the active import graph legitimately expects,
- extract a small helper/type/component if it directly prevents repeated errors,
- revert accidental changes.

Not allowed:

- unrelated redesign,
- add component library without approval,
- rewrite unrelated layout,
- delete duplicates without import map,
- change public architecture without a clear reason.

## After Green Build

Allowed when directly useful for the requested task:

- add icon abstraction,
- add `cn()` utility,
- add chart wrappers,
- add design tokens,
- add reusable modal/table components,
- consolidate duplicated components,
- split large components into maintainable sections,
- improve type-safe adapters and status mapping.

User approval is required for dependency installation, broad architectural replacement, or large cross-module rewrites.


<!-- 09_COMPONENT_STANDARDS.md -->

# 09_COMPONENT_STANDARDS.md

## Cards

Metric cards must include:

- icon area,
- label,
- value,
- status/trend,
- optional progress,
- responsive sizing.

## Tables

Tables must include:

- consistent row height,
- compact typography,
- status badge,
- aligned numeric values,
- subtle hover state.

## Modals

Modals must use Medusa-compatible components if available.

They must include:

- clear title,
- concise description,
- primary action,
- secondary/cancel action,
- safe destructive styling.

## Charts

Charts must use real installed chart library.

No fake chart placeholders.

Charts must be:

- responsive,
- readable,
- visually calm,
- aligned with card spacing.

## Icons

Icons are semantic.

Do not pass unsupported UI props to SVG icon components.

Use a central icon policy after build is green.


<!-- 10_VISUAL_POLISH_PLAN.md -->

# 10_VISUAL_POLISH_PLAN.md

Start visual polish after recovery is stable or when the requested task is specifically a UI improvement.

If the Kernel reports an active build/runtime error, fix the error first unless the UI change is the direct fix.

## Step 1 — Normalize Surfaces

Cards, tables, chart containers, and modals should use consistent:

- radius,
- border,
- shadow,
- padding,
- hover state.

## Step 2 — Normalize Status Language

Create consistent mapping for:

- safe
- warning
- critical
- info
- pending
- success
- failed

Prefer adapter-driven mapping instead of repeated inline conditionals.

## Step 3 — Improve Dashboard Density

Dashboard should feel premium but not oversized.

Use compact SaaS density.

## Step 4 — Mobile-first Refinement

Metric cards should remain beautiful on mobile.

Prefer two cards per row on mobile where feasible and readable.

## Step 5 — Signature Layer

Add subtle plugin-specific identity:

- refined icon containers,
- elegant progress treatments,
- premium section headers,
- polished chart cards.

Avoid loud gradients or decorative noise.

## Step 6 — Maintainable UI Structure

Codex may split large route files into focused local components when it improves readability and does not break the route entry point.

Do not collapse reusable components back into route files just to reduce file count.


<!-- 11_GIT_AND_ROLLBACK_WORKFLOW.md -->

# 11_GIT_AND_ROLLBACK_WORKFLOW.md — Kernel-Owned Backup Workflow

## Kernel Ownership

Snapshot creation, Git backup, and routine rollback checkpoints are handled automatically by the development Kernel.

Codex must not run:

```bash
git add
git commit
git reset
git checkout
```

unless the user explicitly requests that exact Git action.

## Before Codex Edits

Codex should inspect the target files and make a complete targeted edit.

Do not create manual ZIP backups or commits.

## During Recovery

If a change creates more errors than it fixes, Codex should revert only its own last code change when possible, or clearly report the exact file and lines that should be reverted.

Targeted refactoring is acceptable when it lowers rollback risk by simplifying the affected code.

## Never Mix Without Reason

Avoid mixing these in one coding step unless they are directly connected to the same requested task:

- recovery
- dependency installation
- UI redesign
- refactor
- visual polish
- Git/backup operations

Git/backup operations remain Kernel-owned unless explicitly requested.

## Report Format

After editing, report:

```txt
Files changed:
Purpose:
Design/refactor choice:
Rollback risk:
Kernel backup/snapshot: handled automatically
```


<!-- 12_CODEX_PROMPT_TEMPLATE.md -->

# 12_CODEX_PROMPT_TEMPLATE.md

Paste this into Codex:

---

You are working in VS Code on:

`C:\Users\H.M\my-medusa-store`

Important:

The project uses an automatic development Kernel.

The Kernel automatically performs:
- Plugin build
- Backend startup (`medusa develop`)
- Smart rebuilds
- Backend restart when required
- Snapshot and Git backup
- Continue Index and Code Map updates
- Health and event logging

Do not duplicate Kernel-owned operations.

Before editing, read:

1. `PROJECT.md`
2. `00_HARD_RULES.md`
3. `01_ARCHITECTURE_MAP.md`
4. `02_RECOVERY_PROTOCOL.md`
5. `03_AUDIT_COMMANDS.md`
6. `05_VENDOR_CONTRACT.md`
7. `13_DEFINITION_OF_DONE.md`

Current goal:

Focus on coding, recovery, feature implementation, and premium plugin improvement.

Runtime rules:

- Do NOT run `npm run build` unless explicitly requested.
- Do NOT run `medusa develop` unless explicitly requested.
- Do NOT restart the backend unless explicitly requested.
- Do NOT create snapshots or Git backups.
- Do NOT update Continue Index or Code Map.
- Do NOT clean `.medusa` unless explicitly requested.

Coding rules:

- Do not add fake imports or exports.
- Do not assume packages are installed.
- Inspect package.json and vendor files before using dependencies.
- Prefer the smallest complete solution, not the smallest patch.
- Targeted refactoring is allowed when it directly supports the task, reduces complexity, removes duplication, or improves maintainability.
- New files are allowed when directly justified by the task and aligned with existing architecture.
- Avoid broad unrelated rewrites or changing architecture outside the affected feature.
- If Kernel reports build errors, fix the first relevant error before expanding scope.
- Preserve premium UI quality; do not replace real UI with placeholders unless emergency safe mode is requested.

After editing report only:
- Files changed
- Purpose of change
- Design/refactor choice, if any
- Expected Kernel action
- Next recommended action


<!-- 13_DEFINITION_OF_DONE.md -->

# 13_DEFINITION_OF_DONE.md

## Recovery Done

Recovery is done only when the Kernel reports or the user confirms:

- Plugin build passes.
- Backend Medusa admin resolves plugin.
- No Vite import-analysis error remains.
- No TypeScript import/export error remains.
- No missing module error remains.

Codex should not manually run build or backend commands to prove this unless explicitly requested.

## Code Quality Done

- The fix is complete, not a fragile patch.
- Targeted refactors are limited to the affected feature or direct dependency path.
- New files, if created, have clear ownership and reduce complexity.
- No broad unrelated rewrite was performed.
- Types, imports, and exports are consistent with actual project files.

## Vendor Done

- Vendor exports only real installed symbols.
- No invented fake components.
- No accidental dependency leakage.
- Feature components respect the vendor layer unless the existing project pattern intentionally differs.

## UI Done

- Dashboard visually aligns with Medusa Admin.
- Plugin has premium visual signature.
- Cards, tables, modals, charts, icons are consistent.
- Responsive layout works.
- Empty/loading/error states preserve dashboard quality.
- No placeholder downgrade.
- No build errors are reported by Kernel.

## Kernel Compatibility Done

- Codex did not run plugin build manually.
- Codex did not run `medusa develop`.
- Codex did not restart backend manually.
- Codex did not clean `.medusa` manually.
- Codex did not create snapshots or Git backups manually.
- Codex did not update Continue Index or Code Map manually.

## Documentation Done

- Files changed are documented.
- Purpose of each change is documented.
- Design/refactor decisions are documented when relevant.
- Expected Kernel-managed action is documented.
- Remaining risks are listed.

