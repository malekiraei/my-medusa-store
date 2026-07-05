# 02_Dashboard_Kit_Specification

## Project Context

This project is a Medusa v2 Premium Recovery Admin plugin.

Medusa is the platform.

PR Design System is the experience layer.

The goal is not to imitate Medusa UI.

The goal is to build a premium, branded, reusable dashboard system on top of Medusa-compatible architecture.

## Approved Stack

- @medusajs/ui 4.1.17
- @medusajs/icons 2.17.0
- @mantine/core 8.3.18
- @mantine/hooks 8.3.18
- lucide-react 1.21.0
- recharts 3.9.0
- clsx 2.1.1
- React 18.x

## Required Architecture

Libraries
↓
Vendor Layer
↓
Primitive Components
↓
Composite Components
↓
Feature Components
↓
Page

Feature files must not import directly from Mantine, Lucide, Recharts, or Medusa UI.

All external library usage must pass through:

src/ui/vendor
src/ui/components
src/ui/adapters

## Required Upload Structure

Premium-Dashboard-Rewrite/
│
├── 01_Rewrite_Mission.md
├── 02_Dashboard_Kit_Specification.md
├── 03_Reference_Screenshot.png
│
└── src/
    ├── admin/
    │   └── routes/
    │       └── premium-recovery/
    │           ├── page.tsx
    │           └── components/
    │               └── DashboardCards.tsx
    │
    └── ui/
        ├── adapters/
        │   └── status.ts
        │
        ├── vendor/
        │   ├── medusa.ts
        │   ├── mantine.ts
        │   ├── lucide.ts
        │   ├── charts.ts
        │   └── index.ts
        │
        └── components/
            └── metric/
                ├── PRMetricCard.tsx
                ├── PRMetricGrid.tsx
                ├── PRMetricTrend.tsx
                └── index.ts

## Dashboard Visual Tree

DashboardCards
│
├── Premium Hero / Control Center
│   ├── Main Container
│   │   ├── theme-aware background
│   │   ├── subtle border
│   │   ├── rounded premium surface
│   │   ├── responsive padding
│   │   └── soft elevation
│   │
│   ├── Identity Block
│   │   ├── floating icon tile
│   │   ├── title
│   │   ├── subtitle
│   │   └── status description
│   │
│   ├── Status Summary
│   │   ├── dynamic status icon
│   │   ├── dynamic tone
│   │   ├── status label
│   │   └── latest sync text
│   │
│   └── Actions
│       ├── Primary: Create Snapshot
│       └── Secondary: Manual Sync / Quick Check
│
└── Metric Grid
    ├── System Status Card
    ├── Changed Files Card
    ├── Restore Points Card
    └── Bundles Card

## Metric Card Anatomy

Each metric card must contain:

Main Card
│
├── Floating Square Tile
│   ├── positioned at top/start
│   ├── overlaps 1/4 to 1/3 outside the main card
│   ├── rounded-lg or rounded-xl
│   ├── dynamic tone background
│   └── centered icon
│
├── Content
│   ├── title
│   ├── value
│   ├── badge
│   ├── description
│   └── mini trend chart
│
└── Optional Footer
    ├── timestamp
    ├── secondary text
    └── small action

## Mobile-First Policy

The project is mobile-first.

Mobile must be visually premium, not just a compressed desktop layout.

Required grid:

Mobile: 2 cards per row
Tablet: 2 cards per row
Desktop: 4 cards per row

Use:

grid-cols-2 md:grid-cols-2 lg:grid-cols-4

Mobile cards must be:

- compact
- readable
- touch-friendly
- visually rich
- not overcrowded
- capable of showing icon, value, badge, and mini chart

## Dynamic Tone System

Supported tones:

- success
- warning
- error
- info
- neutral

Tone meaning:

success = safe, protected, ready
warning = changed, partial, needs review
error = critical, unprotected, danger
info = active, available, restore data
neutral = empty, unknown, inactive

All visual elements must derive from the same tone:

- floating tile
- badge
- chart stroke
- chart fill
- icon color
- glow/accent
- progress indicator

## RTL / LTR Rule

Never hardcode left or right.

Use logical positioning:

- start
- end
- gap
- justify
- text-start
- text-end

The floating tile must move correctly in both RTL and LTR contexts.

## Theme Rule

No independent theme system.

Respect Medusa active light/dark theme.

Use semantic Medusa classes where appropriate:

- bg-ui-bg-base
- bg-ui-bg-subtle
- text-ui-fg-base
- text-ui-fg-muted
- text-ui-fg-subtle
- border-ui-border-base

## Charts

Use Recharts only through vendor exports.

Preferred visuals:

- mini area chart
- mini line chart
- sparkline

Charts must be subtle:

- no axis
- no legend
- no visual clutter
- small height
- premium fill opacity
- tone-aware stroke

## Icons

Primary icon set:

lucide-react

Secondary icon set:

@medusajs/icons

Icons must be semantic, not decorative only.

Recommended meanings:

- Shield / ShieldCheck: system protection
- FileClock: changed files
- DatabaseBackup: restore points
- Archive: bundles
- RefreshCw: manual sync
- Sparkles: premium recovery identity

## DashboardCards Responsibility

DashboardCards must be a Feature Composition component.

It should:

- receive props
- use status adapter
- prepare view model
- select icons
- render Hero
- render Metric Grid

It should not:

- implement chart internals
- duplicate card markup
- contain complex color logic
- directly import external libraries
- contain unrelated business logic

## Quality Bar

The final result must feel like:

- Linear quality
- Stripe dashboard quality
- Vercel-level polish
- Enterprise SaaS dashboard
- Premium commercial admin plugin

But it must not copy any brand directly.

## Build Rule

After each step:

cd C:\Users\H.M\my-medusa-store\apps\medusa-premium-recovery
npm run build

Build failure means stop and fix.

VS Code warnings that do not affect build are not blocking unless they indicate real architecture damage.

## Cleanup Rule

No dead files should remain at the end.

Do not delete files until:

- all imports are removed
- replacement is stable
- build succeeds
- usage paths are checked
