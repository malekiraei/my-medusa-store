# 08_FILE_OWNERSHIP_RULES.md

## Purposeful Editing

Every edit must have a purpose:

- recover build,
- implement the requested feature,
- normalize vendor boundaries,
- improve a known component,
- remove duplication in the affected area,
- polish UI after build is green.

## While Broken

Allowed edits:

- fix bad imports,
- fix missing real exports,
- fix incompatible types,
- fix package declaration mismatch,
- create a missing file that the active import graph legitimately expects,
- extract a small helper/type/component if it directly prevents repeated errors,
- revert accidental changes.

Not allowed:

- unrelated redesign,
- add component library without approval,
- rewrite unrelated layout,
- delete duplicates without import map,
- change public architecture without a clear reason.

## After Green Build

Allowed when directly useful for the requested task:

- add icon abstraction,
- add `cn()` utility,
- add chart wrappers,
- add design tokens,
- add reusable modal/table components,
- consolidate duplicated components,
- split large components into maintainable sections,
- improve type-safe adapters and status mapping.

User approval is required for dependency installation, broad architectural replacement, or large cross-module rewrites.
