# 12_CODEX_PROMPT_TEMPLATE.md

Paste this into Codex:

---

You are working in VS Code on:

`${workspaceFolder}`

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
- Do NOT run `medusa plugin:build` unless explicitly requested.
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
- Do not manually test whether the build is green after each edit; wait for Kernel/user-provided output.
- If Kernel reports build errors, fix the first relevant error before expanding scope, then stop and let Kernel re-validate.
- Preserve premium UI quality; do not replace real UI with placeholders unless emergency safe mode is requested.

After editing, stop. Do not build/restart/backup/index. Report only:
- Files changed
- Purpose of change
- Design/refactor choice, if any
- Expected Kernel action
- Next recommended action
