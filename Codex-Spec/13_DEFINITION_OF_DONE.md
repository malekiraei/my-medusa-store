# 13_DEFINITION_OF_DONE.md

## Recovery Done

Recovery is done only when the Kernel reports or the user confirms:

- Plugin build passes.
- Backend Medusa admin resolves plugin.
- No Vite import-analysis error remains.
- No TypeScript import/export error remains.
- No missing module error remains.

Codex should not manually run build or backend commands to prove this unless explicitly requested. Codex should not perform a manual green-build test after each edit.

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
- Codex did not manually test green build after every edit.
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
