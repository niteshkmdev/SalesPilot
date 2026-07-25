# Plan 06: Leads Management

## Objective

Build the core lead management slice including CRUD, assignment, status/source handling, server actions, services, and UI workflows.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[~]` In progress
- Current task: Lead CRUD UI polished with DTO mapping, list filters (search/status/source), and create/view/edit wired. Assignment UI still deferred.
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
- `[x]` Update `PROJECT_TRACKER.md` on completion.

## Implementation Rules

- DTOs and Services must be used; never call Prisma directly from UI components.
- Enforce permissions: Owners/Admins can see/edit all; Members can only edit assigned leads.
- Do not delete leads directly; use the `deletedAt` soft-delete field.

## Foundation debt (from Plan 01 re-audit)

- Move lead service/repo/DTO from `src/server/{services,repositories,dto}` into `src/modules/leads/`.
- Replace role-name authz (`"Owner"`, `"Admin"`) with `Permissions.*` + `createAuthorizationService`.
- Use `requireAppContext` and `src/shared/api` envelopes in lead actions instead of ad-hoc `{ success }` / raw Prisma session lookups.
- Finish assignment UI.
