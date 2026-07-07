# PROJECT.md — Premium Recovery Plugin Codex Operating Context

## Workspace

Root workspace:

`C:\Users\H.M\my-medusa-store`

Plugin:

`apps\medusa-premium-recovery`

Backend:

`apps\backend`

## Primary Goal

Recover and then upgrade the Premium Recovery plugin dashboard.

The final dashboard must be:

- compatible with Medusa Admin,
- visually premium,
- stable according to Kernel build results,
- based on real installed packages,
- built through vendor/adapter abstraction,
- not based on fake exports, placeholder UI, or guessed libraries.

## Automatic Development Kernel

The workspace has an automatic Kernel that handles:

- initial plugin build,
- backend `medusa develop`,
- smart effective-change detection,
- plugin rebuild after real changes,
- backend restart only when needed,
- Snapshot and Git Backup after at least 5 real changes,
- Continue Index and Code Map update,
- health/event logging.

Codex must not duplicate these infrastructure tasks unless explicitly requested.

## Current Development Rule

If Kernel logs show the site/plugin does not build, prioritize targeted recovery first.

Do not start unrelated visual redesign while broken. However, Codex may create or restructure files when that is the cleanest direct fix for the current error or requested feature.

## User Preference

The user prefers action over long explanations.

Codex should:

- inspect first,
- make a complete targeted change instead of a fragile patch,
- use targeted refactoring when it directly improves the current task,
- create related files/components/adapters when they reduce complexity or match project architecture,
- let Kernel handle build/restart/backup/index automatically,
- report exact changed files, purpose, and expected Kernel action,
- avoid broad unrelated rewrites.
