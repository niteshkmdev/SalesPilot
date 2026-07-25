# Plan 09: Lead Forms & Public Submissions

## Objective

Authenticated lead-form management and public submissions that create leads (with custom field values) atomically, protected by Turnstile when configured.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete (joint wave with Plan 08)
- Current task: Closed — admin forms UI + public `/forms/[orgSlug]/[formSlug]` submit path
- Dependency: `08-custom-fields` (built in same wave)
- Next prompt after completion: `prompt/10-search.md`

## Assumptions / deviations

1. Public URL: `/forms/[orgSlug]/[formSlug]` (org slug is globally unique). Docs’ `/forms/{slug}` would collide across orgs.
2. Admin editor at `/forms/edit/[id]` (avoids Next.js conflict with public `[orgSlug]` segment).
3. Form field config stored as `LeadForm.fields` JSON (no FormField table).
4. Activity row written on submit; timeline UI remains Plan 11. Notifications deferred to Plan 12.
5. Turnstile via `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; skip verify when unset (dev).
6. Branding read-only from org Branding model; settings UI is Plan 14.
7. Server Actions (not REST) for MVP.

## Task Checklist

- `[x]` Draft plan (joint with 08)
- `[x]` Extend LeadForm schema (fields, default manager, success message, indexing)
- `[x]` Lead-forms module (CRUD, publish/archive, public submit)
- `[x]` Admin UI + Forms nav
- `[x]` Public form page + Turnstile + atomic submit
- `[x]` Unit tests
- `[x]` Update tracker on completion

## Out of scope

- Round-robin assignment, file uploads, per-form branding
- Activity timeline UI / Notifications
- REST `/api/lead-forms` parity
