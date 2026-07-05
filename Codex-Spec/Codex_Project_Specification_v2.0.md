

<!-- README.md -->


# Codex Premium Dashboard Project Specification v2.0

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
5. Run the audit commands in `03_AUDIT_COMMANDS.md`
6. Do not redesign until the build is green.

## Included Assets

The previous v1 specification and the originally uploaded instruction ZIP are included under `assets/`.



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
- stable under `npm run build`,
- based on real installed packages,
- built through vendor/adapter abstraction,
- not based on fake exports, placeholder UI, or guessed libraries.

## Current Development Rule

If the site/plugin does not build, all visual development stops.

The only allowed task while broken is recovery.

## User Preference

The user prefers action over long explanations.

Codex should:

- inspect first,
- edit minimal files,
- build after every step,
- report exact changed files,
- avoid speculative refactors,
- avoid creating files unless approved or build is green.



<!-- 00_HARD_RULES.md -->


# 00_HARD_RULES.md — Non-Negotiable Rules

## 1. Build First

If `npm run build` fails, do not redesign UI.

Fix the build only.

## 2. No Fake Imports

Do not use any package, symbol, export, or alias unless verified in:

- package.json
- package-lock.json
- vendor files
- installed dependency tree

## 3. No New Files While Broken

When build is broken, do not create new files.

Modify only existing files needed for recovery.

## 4. No Dependency Assumptions

Before using any of these, verify they are installed:

- clsx
- recharts
- lucide-react
- @mantine/core
- @medusajs/ui
- @medusajs/icons

## 5. Vendor Contract First

Feature components should not import third-party UI dependencies directly unless the existing project already does so consistently.

Preferred route:

`feature component -> src/ui/vendor/* -> real installed library`

## 6. Existing Architecture Wins

Do not impose a new architecture before mapping the current one.

## 7. Build After Every Edit

After each recovery edit:

```bash
cd C:\Users\H.M\my-medusa-store\apps\medusa-premium-recovery
npm run build
```

## 8. Stop on First New Error

If a new error appears, stop and fix that error.

## 9. No Placeholder Downgrade

Do not replace charts/cards/tables with placeholder text unless user explicitly requests emergency safe mode.

## 10. Report Precisely

Every response after editing must include:

- files changed,
- command run,
- build result,
- next action.



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

## Known Risk Area

Duplicate files such as:

```txt
src/ui/components/PRMetricCard.tsx
src/ui/components/metric/PRMetricCard.tsx
```

must be audited before deletion. Do not remove while build is broken unless that file is the direct source of the error and the import graph is known.



<!-- 02_RECOVERY_PROTOCOL.md -->


# 02_RECOVERY_PROTOCOL.md — Broken Build Recovery

## Step 1 — Run Plugin Build

```bash
cd C:\Users\H.M\my-medusa-store\apps\medusa-premium-recovery
npm run build
```

## Step 2 — Classify the First Error

### Missing dependency

Example:

```txt
Cannot find module 'clsx'
```

Action:
- verify `package.json`
- install only if user approves
- export through vendor only after installed

### Missing vendor export

Example:

```txt
Module "../vendor" has no exported member "MantineBadge"
```

Action:
- inspect `src/ui/vendor/index.ts`
- inspect relevant vendor submodule
- add only real export or change consumer to existing export

### Wrong icon props

Example:

```txt
Property 'level' does not exist on LucideProps
```

Action:
- identify wrong component resolution
- do not pass UI props to SVG icon
- use correct UI component or existing status wrapper

### Admin entry resolution failure

Example:

```txt
Failed to resolve import "medusa-premium-recovery/admin"
```

Action:
- confirm plugin build output
- confirm package name
- clean backend `.medusa`
- rebuild plugin
- restart backend
- do not create new files unless original admin entry is missing and user approves

## Step 3 — Clean Cache if Needed

Backend:

```bash
cd C:\Users\H.M\my-medusa-store\apps\backend
rmdir /s /q .medusa
```

Plugin:

```bash
cd C:\Users\H.M\my-medusa-store\apps\medusa-premium-recovery
rmdir /s /q .medusa
```

## Step 4 — Windows Lock Error

If:

```txt
EPERM unlink esbuild.exe
```

Run:

```bash
taskkill /F /IM node.exe
```

Then retry after closing active dev servers.

## Step 5 — Recovery Exit Condition

Recovery is complete only when:

- plugin `npm run build` succeeds,
- backend admin can resolve plugin admin extension,
- no TypeScript errors remain.



<!-- 03_AUDIT_COMMANDS.md -->


# 03_AUDIT_COMMANDS.md

Run these before any meaningful change.

## From workspace root

```bash
cd C:\Users\H.M\my-medusa-store
npm ls @medusajs/ui @medusajs/icons clsx recharts lucide-react @mantine/core react react-dom
```

## From plugin root

```bash
cd C:\Users\H.M\my-medusa-store\apps\medusa-premium-recovery
npm pkg get name version dependencies devDependencies peerDependencies
npm run build
```

## Inspect files

Open and inspect:

```txt
src/ui/vendor/index.ts
src/ui/vendor/medusa.ts
src/ui/vendor/mantine.ts
src/ui/vendor/charts.ts
src/ui/vendor/lucide.ts
src/ui/adapters/status.ts
src/admin/routes/premium-recovery/page.tsx
src/admin/routes/premium-recovery/components/DashboardCards.tsx
```

## Required Audit Output

Before editing, Codex should summarize:

```txt
Build status:
First error:
Installed relevant packages:
Missing packages:
Vendor exports:
Files causing current failure:
Minimal fix plan:
```



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

## Do Not Edit Randomly

Every edit must have a purpose:

- recover build,
- normalize vendor,
- improve a known component,
- polish UI after build is green.

## While Broken

Allowed edits:

- fix bad imports,
- fix missing real exports,
- fix incompatible types,
- fix package declaration mismatch,
- revert accidental changes.

Not allowed:

- redesign,
- add component library,
- add new abstraction files,
- rewrite layout,
- delete duplicates without import map.

## After Green Build

Allowed with user approval:

- add icon abstraction,
- add `cn()` utility,
- add chart wrappers,
- add design tokens,
- add reusable modal/table components.



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

Only start this after build is green.

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



<!-- 11_GIT_AND_ROLLBACK_WORKFLOW.md -->


# 11_GIT_AND_ROLLBACK_WORKFLOW.md

## Before Codex Edits

Recommended:

```bash
git status
git add .
git commit -m "checkpoint before codex recovery"
```

If git is not available, create a ZIP backup.

## During Recovery

After each successful build:

```bash
git add .
git commit -m "recover build step"
```

## Rollback Rule

If a change creates more errors than it fixes, revert that change immediately.

## Never Mix

Do not mix these in one commit:

- recovery
- dependency installation
- UI redesign
- refactor
- visual polish



<!-- 12_CODEX_PROMPT_TEMPLATE.md -->


# 12_CODEX_PROMPT_TEMPLATE.md

Paste this into Codex:

---

You are working in VS Code on:

`C:\Users\H.M\my-medusa-store`

Before editing, read the files in `Codex-Spec-v2`:

1. `PROJECT.md`
2. `00_HARD_RULES.md`
3. `01_ARCHITECTURE_MAP.md`
4. `02_RECOVERY_PROTOCOL.md`
5. `03_AUDIT_COMMANDS.md`

Current goal:

Recover the Medusa Premium Recovery plugin build first.

Rules:

- Do not create new files while build is broken.
- Do not redesign UI while build is broken.
- Do not add fake exports.
- Do not assume installed packages.
- Inspect package.json and vendor files first.
- Fix only the current build errors.
- Run `npm run build` after edits.
- Report changed files and build result.

After build is green, stop and ask before visual polish.



<!-- 13_DEFINITION_OF_DONE.md -->


# 13_DEFINITION_OF_DONE.md

## Recovery Done

- Plugin build passes.
- Backend Medusa admin resolves plugin.
- No Vite import-analysis error.
- No TypeScript import/export error.
- No missing module error.

## Vendor Done

- Vendor exports only real installed symbols.
- No invented fake components.
- No accidental dependency leakage.

## UI Done

- Dashboard visually aligns with Medusa Admin.
- Plugin has premium visual signature.
- Cards, tables, modals, charts, icons are consistent.
- Responsive layout works.
- No placeholder downgrade.
- No build errors.

## Documentation Done

- Files changed are documented.
- Commands run are documented.
- Remaining risks are listed.
