# Codex Premium Dashboard Project Specification v2.2 — Kernel-Compatible / Performance-Optimized

Use this package inside VS Code/Codex for the Medusa Premium Recovery plugin.

## Recommended VS Code Folder

Open the workspace root:

`${workspaceFolder}`

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

Codex should edit code, improve the plugin, and report what changed. Codex should not duplicate Kernel-owned operations or manually test green build after each edit.

## Performance Rule

Codex is allowed to make targeted refactors, create related files, and improve architecture when those changes directly support the requested task, reduce complexity, remove duplication, or make the plugin easier to maintain.

Avoid broad, unrelated rewrites.

## Included Assets

The previous v1 specification and originally uploaded instruction ZIPs are included under `assets/`.
