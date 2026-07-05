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
