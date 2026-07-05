# 08_FILE_OWNERSHIP_RULES.md

## Do Not Edit Randomly

Every edit must have a purpose:

- recover build,
- normalize vendor,
- improve a known component,
- polish UI after build is green.

## While Broken

Allowed edits:

- fix bad imports,
- fix missing real exports,
- fix incompatible types,
- fix package declaration mismatch,
- revert accidental changes.

Not allowed:

- redesign,
- add component library,
- add new abstraction files,
- rewrite layout,
- delete duplicates without import map.

## After Green Build

Allowed with user approval:

- add icon abstraction,
- add `cn()` utility,
- add chart wrappers,
- add design tokens,
- add reusable modal/table components.
