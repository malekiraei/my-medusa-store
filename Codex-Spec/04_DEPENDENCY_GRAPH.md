# 04_DEPENDENCY_GRAPH.md

## Dependency Categories

### Medusa Native

Preferred for Medusa admin compatibility:

- `@medusajs/ui`
- `@medusajs/icons`

### Utility

Allowed if installed and declared:

- `clsx`

Use case:

- conditional className composition
- card variants
- badge variants
- active/disabled states
- responsive classes

### Charts

Allowed if installed and vendor-wrapped:

- `recharts`

Use case:

- trend charts
- donut/pie status charts
- recovery activity charts

### Optional Icons

Allowed only after audit:

- `lucide-react`

Use only through vendor/icon abstraction.

### Optional UI Toolkit

Allowed only after audit:

- `@mantine/core`

Use only if installed and already accepted by project architecture.

## Dependency Rule

Do not introduce package imports directly into feature components without verifying project policy.

Preferred:

```txt
component -> ui/vendor -> package
```

## clsx Policy

If `clsx` is installed and package.json includes it, the vendor index may export:

```ts
export { default as clsx } from "clsx"
```

Do not add this if `clsx` is missing.
