# 05_VENDOR_CONTRACT.md

## Purpose

Vendor files are not design-system components.

They are compatibility boundaries.

## Rules

- Export only real installed symbols.
- Do not define fake components.
- Do not rename symbols unless alias points to a real export.
- Do not mix unrelated responsibilities.

## Recommended Index

Keep the index simple:

```ts
export * from "./medusa"
export * from "./lucide"
export * from "./charts"
export * from "./mantine"
```

If `clsx` is installed:

```ts
export { default as clsx } from "clsx"
```

## Alias Rule

Aliases such as:

```ts
export { Badge as MantineBadge }
```

are only allowed inside the correct vendor submodule if:

- `@mantine/core` is installed,
- `Badge` exists,
- consumer files actually require that alias.

Prefer changing consumers to official names over creating excessive aliases.

## Error Handling

If consumer imports a missing symbol:

1. Find the consumer file.
2. Find the intended source.
3. Verify package/export exists.
4. Add real vendor export or update consumer.
5. Build.
