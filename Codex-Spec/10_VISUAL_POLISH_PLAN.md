# 10_VISUAL_POLISH_PLAN.md

Start visual polish after recovery is stable or when the requested task is specifically a UI improvement.

If the Kernel reports an active build/runtime error, fix the error first unless the UI change is the direct fix.

## Step 1 — Normalize Surfaces

Cards, tables, chart containers, and modals should use consistent:

- radius,
- border,
- shadow,
- padding,
- hover state.

## Step 2 — Normalize Status Language

Create consistent mapping for:

- safe
- warning
- critical
- info
- pending
- success
- failed

Prefer adapter-driven mapping instead of repeated inline conditionals.

## Step 3 — Improve Dashboard Density

Dashboard should feel premium but not oversized.

Use compact SaaS density.

## Step 4 — Mobile-first Refinement

Metric cards should remain beautiful on mobile.

Prefer two cards per row on mobile where feasible and readable.

## Step 5 — Signature Layer

Add subtle plugin-specific identity:

- refined icon containers,
- elegant progress treatments,
- premium section headers,
- polished chart cards.

Avoid loud gradients or decorative noise.

## Step 6 — Maintainable UI Structure

Codex may split large route files into focused local components when it improves readability and does not break the route entry point.

Do not collapse reusable components back into route files just to reduce file count.
