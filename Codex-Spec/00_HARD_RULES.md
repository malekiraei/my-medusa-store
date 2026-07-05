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
