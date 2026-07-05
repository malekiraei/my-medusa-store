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
