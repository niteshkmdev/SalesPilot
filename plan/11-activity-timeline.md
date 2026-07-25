# Plan 11: Activity Timeline

## Objective

Append-only lead activity recording and lead-detail timeline UI (who changed what and when). Joint wave with Plan 12.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete (joint wave with Plan 12)
- Current task: Closed — activity module, lead side-effects, lead detail timeline
- Dependency: `06-leads-management` (complete); Plan 10 Search skipped
- Next after joint wave: `prompt/13-storage-attachments.md` (or revisit Plan 07)

## Assumptions / deviations

1. Leads only for MVP (no org-wide feed / dashboard widget — Plan 07 still deferred).
2. Thin side-effects helper after lead mutations (no full event bus).
3. Form submit keeps atomic `lead.created_from_form` activity in the same transaction via activity module.
4. Lead mutation side-effects are best-effort after commit (do not roll back lead writes).
5. Server Actions / RSC load for timeline (no REST `/api/activities` yet).

## Task Checklist

- `[x]` Draft plan (joint with 12)
- `[x]` Activity module (dto/repo/service/format)
- `[x]` Migrate form `createActivityRecord` into activity module
- `[x]` Wire lead create/update/assign/delete
- `[x]` Lead detail timeline UI
- `[x]` Unit tests
- `[x]` Update tracker on completion

## Out of scope

- Org-wide activity feed, member/form timelines
- Dashboard recent-activity widget (Plan 07)
- Activity search/export
