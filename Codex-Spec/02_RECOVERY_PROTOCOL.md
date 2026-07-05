# 02_RECOVERY_PROTOCOL.md — Broken Build Recovery

## Step 1 — Run Plugin Build

```bash
cd C:\Users\H.M\my-medusa-store\apps\medusa-premium-recovery
npm run build
```

## Step 2 — Classify the First Error

### Missing dependency

Example:

```txt
Cannot find module 'clsx'
```

Action:
- verify `package.json`
- install only if user approves
- export through vendor only after installed

### Missing vendor export

Example:

```txt
Module "../vendor" has no exported member "MantineBadge"
```

Action:
- inspect `src/ui/vendor/index.ts`
- inspect relevant vendor submodule
- add only real export or change consumer to existing export

### Wrong icon props

Example:

```txt
Property 'level' does not exist on LucideProps
```

Action:
- identify wrong component resolution
- do not pass UI props to SVG icon
- use correct UI component or existing status wrapper

### Admin entry resolution failure

Example:

```txt
Failed to resolve import "medusa-premium-recovery/admin"
```

Action:
- confirm plugin build output
- confirm package name
- clean backend `.medusa`
- rebuild plugin
- restart backend
- do not create new files unless original admin entry is missing and user approves

## Step 3 — Clean Cache if Needed

Backend:

```bash
cd C:\Users\H.M\my-medusa-store\apps\backend
rmdir /s /q .medusa
```

Plugin:

```bash
cd C:\Users\H.M\my-medusa-store\apps\medusa-premium-recovery
rmdir /s /q .medusa
```

## Step 4 — Windows Lock Error

If:

```txt
EPERM unlink esbuild.exe
```

Run:

```bash
taskkill /F /IM node.exe
```

Then retry after closing active dev servers.

## Step 5 — Recovery Exit Condition

Recovery is complete only when:

- plugin `npm run build` succeeds,
- backend admin can resolve plugin admin extension,
- no TypeScript errors remain.
