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
