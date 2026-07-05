# 01_Rewrite_Mission

## Primary Objective

Your task is to completely redesign and rewrite the uploaded Dashboard UI files.

Do not review, patch, or partially refactor the current implementation.

You must rewrite each uploaded UI file as a complete, coherent, production-ready file.

Preserve all business logic, public props, domain meaning, adapters, and data flow.

Redesign only presentation, composition, visual hierarchy, layout, responsiveness, motion, and component structure.

## Required Reading Order

Read the files in this exact order:

1. 01_Rewrite_Mission.md
2. 02_Dashboard_Kit_Specification.md
3. 03_Reference_Screenshot.png
4. Source files under src/

## Non-Negotiable Rules

- Do not change business logic.
- Do not change hooks, services, machines, or domain behavior.
- Do not remove existing functionality.
- Do not hardcode RTL or LTR.
- Do not hardcode colors in feature files.
- Do not use inline styles.
- Do not use handmade SVG.
- Do not import directly from external libraries inside feature components.
- Use the existing Vendor Layer.
- Rewrite files fully, not in fragments.
- Keep the project modular and maintainable.
- Build must pass after every rewritten step.

## Absolute Visual Goal

The final Dashboard must look and feel like a premium enterprise product.

It must be visually superior to typical commercial premium plugins.

The UI must be mobile-first, elegant, responsive, theme-aware, RTL/LTR-aware, and highly polished.

## Expected Rewrite Scope

Rewrite and improve:

- DashboardCards.tsx
- PRMetricCard.tsx
- PRMetricGrid.tsx
- PRMetricTrend.tsx
- Related metric visual structure if needed

Do not rewrite unrelated business files unless required for presentation integration.

## Final Output Requirement

Return complete rewritten files.

Do not return partial snippets.

Do not explain theory.

Provide practical code ready to paste into the project.
