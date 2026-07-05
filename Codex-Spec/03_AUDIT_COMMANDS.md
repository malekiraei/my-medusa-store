# 03_AUDIT_COMMANDS.md

Run these before any meaningful change.

## From workspace root

```bash
cd C:\Users\H.M\my-medusa-store
npm ls @medusajs/ui @medusajs/icons clsx recharts lucide-react @mantine/core react react-dom
```

## From plugin root

```bash
cd C:\Users\H.M\my-medusa-store\apps\medusa-premium-recovery
npm pkg get name version dependencies devDependencies peerDependencies
npm run build
```

## Inspect files

Open and inspect:

```txt
src/ui/vendor/index.ts
src/ui/vendor/medusa.ts
src/ui/vendor/mantine.ts
src/ui/vendor/charts.ts
src/ui/vendor/lucide.ts
src/ui/adapters/status.ts
src/admin/routes/premium-recovery/page.tsx
src/admin/routes/premium-recovery/components/DashboardCards.tsx
```

## Required Audit Output

Before editing, Codex should summarize:

```txt
Build status:
First error:
Installed relevant packages:
Missing packages:
Vendor exports:
Files causing current failure:
Minimal fix plan:
```
