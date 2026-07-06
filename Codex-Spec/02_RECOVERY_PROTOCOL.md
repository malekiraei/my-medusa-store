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
