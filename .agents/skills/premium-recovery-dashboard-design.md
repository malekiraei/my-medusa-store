# Premium Recovery Dashboard Design Method

This document captures the intended design method for the Premium Recovery dashboard so future Codex sessions preserve the same visual and product logic.

## Purpose Of DashboardCards

`DashboardCards` is an operational snapshot summary for the Premium Recovery admin route.

It is not a fake health panel, fake recovery score panel, fake readiness panel, or fake protection dashboard. It should summarize real snapshot-related state and reserve stable surfaces for future real product domains.

## Visual Hierarchy

The dashboard regions have distinct jobs:

- Hero: workflow entry point for the snapshot workspace and primary actions.
- Snapshot Signals: compact current-state strip for Git state, snapshot status, changed files, snapshot records, and bundle tracking.
- Snapshot Activity: trend area reserved for future real snapshot activity. Preview data is allowed only when visibly labeled as preview.
- KPI cards: reserved enterprise metric surfaces with strong visual identity and stable placement.
- Snapshot Records: actual file-backed snapshot list and the primary evidence surface for stored snapshot records.

Do not collapse these regions into one another just because some current values overlap. The overlap is temporary while the product has a smaller set of real backend data.

## KPI Card Design Rules

KPI cards should keep a stable enterprise style:

- Use a colored icon tile to establish card identity.
- Use one bottom accent line as the only card-edge accent.
- Do not add a competing left vertical accent.
- The bottom accent may feel signal-like, but it must not imply a fake percentage, completion state, readiness, score, or progress metric.
- Keep badges aligned in the upper-right header area.
- Keep labels compact, uppercase, and scannable.
- Keep metric values larger than descriptions but not hero-scale.
- Keep descriptions muted and limited to short operational copy.
- Keep icon tiles balanced inside the card; they should not awkwardly overflow above the card.
- Use hover polish sparingly: subtle lift, border refinement, or elevation is acceptable.
- Card identity comes from icon color plus bottom accent, not from multiple competing decorative treatments.

Do not change card order, wording, actions, or data interpretation unless the product behavior task explicitly requires it.

## Truthfulness Rules

The dashboard must not display or imply:

- fake health
- fake protection
- fake recovery readiness
- fake score
- fake risk
- fake confidence
- fake bundle readiness
- fake restore availability
- fake production activity

Preview chart data must be visibly labeled as `Preview data`, isolated in the rendering component, and never connected to hooks, services, APIs, backend storage, or shared product types.

## Future Expansion Rules

KPI cards may later map to real supported domains such as:

- Database Backup
- Restore
- Retention
- Storage Usage
- Coverage
- Recent Activity

Only add these when the backend/domain supports real data. Do not remove the KPI card structure merely because today's snapshot data overlaps with Snapshot Signals.

Future data must follow the established architecture:

```text
UI
-> hooks
-> services/adapters
-> backend contracts
-> filesystem/storage or domain storage
```

## UI Stability Principle

Once a dashboard region matures visually, do not redesign it casually.

Extend existing regions before creating new visual patterns. Keep Hero, Snapshot Signals, Snapshot Activity, KPI cards, and Snapshot Records visually consistent as future modules arrive.

## Reuse Rules

- Use existing Medusa UI/vendor wrappers.
- Use existing metric components.
- Use existing status, tone, and identity helpers.
- Do not create a new visual system unless the task explicitly approves it.
- Prefer small refinements to established surfaces over broad redesigns.
