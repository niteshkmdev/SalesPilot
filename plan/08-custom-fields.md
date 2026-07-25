# Plan 08: Custom Fields

## Objective

Ship organization-scoped custom field definitions, values on CRM leads, validation, settings UI, and hooks that Plan 09 forms can compose.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete (joint wave with Plan 09)
- Current task: Closed — custom fields module, settings UI, lead create/edit/detail integration
- Dependency: `06-leads-management`
- Next after joint wave: `prompt/10-search.md` (Plan 07 deferred)

## Assumptions (docs/15 empty)

1. MVP UI types: `TEXT`, `TEXTAREA`, `EMAIL`, `PHONE`, `NUMBER` only.
2. Permissions: `customfield.read` / `customfield.manage`.
3. Member limited update unchanged — custom values on update require `canEditFull`.
4. Deactivate (`active: false`) instead of hard-delete when values exist.
5. Forms compose org definitions; they do not own field definitions.

## Task Checklist

- `[x]` Draft plan (joint with 09)
- `[x]` Schema/permissions as needed
- `[x]` Custom fields module (dto/repo/service)
- `[x]` Settings UI `/settings/custom-fields`
- `[x]` Lead create/edit/detail integration
- `[x]` Unit tests
- `[x]` Update tracker on completion

## Out of scope

- SELECT/DATE/CHECKBOX UI, options storage
- Public form rendering (Plan 09)
- Dashboard widgets (Plan 07 deferred)
