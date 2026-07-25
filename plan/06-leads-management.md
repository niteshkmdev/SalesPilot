# Plan 06: Leads Management

## Objective

Build the core lead management slice including CRUD, assignment, status/source handling, server actions, services, and UI workflows.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete
- Current task: Plan 06 closed — domain in `src/modules/leads/`, permission authz, assignment UI, expanded filters, pagination/sorting, soft-delete UI, duplicate-flag foundations, unit tests.
- Dependency: `05-members-roles-settings`
- Next prompt after completion: `prompt/07-dashboard-v1.md`

## Task Checklist

- `[x]` Draft implementation plan for Leads Management.
- `[x]` Get plan approval from user.
- `[x]` Build Lead DTOs (Zod validation).
- `[x]` Build Lead Repository (Prisma CRUD).
- `[x]` Build Lead Service (Business logic & Authorization).
- `[x]` Create Next.js Server Actions for Leads.
- `[x]` Implement `/leads` Data Table.
- `[x]` Implement `/leads/new` form.
- `[x]` Implement `/leads/[id]` detail view.
- `[x]` Ensure organizations have default Statuses/Sources upon creation.
- `[x]` Move lead domain into `src/modules/leads/` (Plan 01 debt).
- `[x]` Replace role-string authz with `Permissions.LEAD_*`.
- `[x]` Use `requireAppContext` + `AppError` envelopes in lead actions.
- `[x]` Assignment UI (form selects + detail dialog).
- `[x]` Expanded filters, pagination, sorting, soft-delete UI, duplicate foundations.
- `[x]` Unit tests for authz, assign, filters, duplicate flag.
- `[x]` Update `PROJECT_TRACKER.md` on completion.

## Implementation Rules

- DTOs and Services must be used; never call Prisma directly from UI components.
- Enforce permissions: Owners/Admins can see/edit all; Members can only edit assigned leads.
- Do not delete leads directly; use the `deletedAt` soft-delete field.

## Foundation debt (from Plan 01 re-audit)

- `[x]` Move lead service/repo/DTO from `src/server/{services,repositories,dto}` into `src/modules/leads/`.
- `[x]` Replace role-name authz (`"Owner"`, `"Admin"`) with `Permissions.*` + `createAuthorizationService`.
- `[x]` Use `requireAppContext` and `src/shared/api` envelopes in lead actions instead of ad-hoc `{ success }` / raw Prisma session lookups.
- `[x]` Finish assignment UI.

## UI-first carve-out note (Plan 02)

- Live dashboard metrics/notifications widgets are Plan 07 (dashboard page still shows sample data by design).
- Public lead forms are Plan 09; notifications page is Plan 12.
- Activity timeline, rich notes, attachments, merge wizard, Atlas Search, bulk actions, and REST `/api/leads/*` remain later plans.
