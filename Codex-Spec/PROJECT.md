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
- stable under `npm run build`,
- based on real installed packages,
- built through vendor/adapter abstraction,
- not based on fake exports, placeholder UI, or guessed libraries.

## Current Development Rule

If the site/plugin does not build, all visual development stops.

The only allowed task while broken is recovery.

## User Preference

The user prefers action over long explanations.

Codex should:

- inspect first,
- edit minimal files,
- build after every step,
- report exact changed files,
- avoid speculative refactors,
- avoid creating files unless approved or build is green.
