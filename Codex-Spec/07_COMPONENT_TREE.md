# 07_COMPONENT_TREE.md

## Expected Component Hierarchy

```txt
Admin page
  Page header
  Dashboard summary
    Metric grid
      Metric card
      Metric trend
  System health
    health card
    chart card
  Recovery activity
    operations table
    status badges
  Modals/dialogs
    confirmation modal
    restore modal
```

## Component Ownership

### Route-level files

May compose sections but should not own reusable visual primitives.

### `ui/components/metric`

Owns metric cards, grids, and trends.

### `ui/adapters`

Owns data-to-presentation mapping.

### `ui/vendor`

Owns third-party export boundaries only.

## Duplicate Rule

If two components have the same name in different paths:

1. map imports first,
2. determine which is active,
3. keep compatibility until build is green,
4. consolidate only after build is green.
