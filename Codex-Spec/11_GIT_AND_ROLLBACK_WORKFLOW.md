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
