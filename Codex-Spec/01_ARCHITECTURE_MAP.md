# 01_ARCHITECTURE_MAP.md

## Workspace Structure

Expected structure:

```txt
my-medusa-store/
  apps/
    backend/
    medusa-premium-recovery/
```

## Plugin Areas

Expected plugin areas:

```txt
apps/medusa-premium-recovery/
  package.json
  src/
    admin/
      index.ts
      routes/
        premium-recovery/
          page.tsx
          components/
            DashboardCards.tsx
    ui/
      adapters/
      components/
      vendor/
```

## Core Layers

### 1. Admin Route Layer

Responsible for Medusa admin pages.

Files may include:

- `src/admin/index.ts`
- `src/admin/routes/premium-recovery/page.tsx`
- route-level dashboard components

### 2. Feature UI Layer

Dashboard-specific UI.

Example:

- `DashboardCards.tsx`
- system health cards
- operation tables
- recovery trend components

### 3. UI Components Layer

Reusable plugin components.

Example:

- metric cards
- grids
- trends
- badges
- chart cards

### 4. Adapters Layer

Maps domain/plugin status into UI presentation descriptors.

Example:

- `src/ui/adapters/status.ts`

### 5. Vendor Layer

Boundary around installed libraries.

Example:

- `src/ui/vendor/index.ts`
- `src/ui/vendor/medusa.ts`
- `src/ui/vendor/mantine.ts`
- `src/ui/vendor/charts.ts`
- `src/ui/vendor/lucide.ts`

Vendor must only re-export real installed symbols.

## Known Risk Area

Duplicate files such as:

```txt
src/ui/components/PRMetricCard.tsx
src/ui/components/metric/PRMetricCard.tsx
```

must be audited before deletion. Do not remove while build is broken unless that file is the direct source of the error and the import graph is known.
