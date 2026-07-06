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
