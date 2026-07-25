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
- Current task: Awaiting user approval on the implementation plan.
- Dependency: `05-members-roles-settings`
- Next prompt after completion: `prompt/07-dashboard-v1.md`

## Task Checklist

- `[x]` Draft implementation plan for Leads Management.
- `[ ]` Get plan approval from user.
- `[ ]` Build Lead DTOs (Zod validation).
- `[ ]` Build Lead Repository (Prisma CRUD).
- `[ ]` Build Lead Service (Business logic & Authorization).
- `[ ]` Create Next.js Server Actions for Leads.
- `[ ]` Implement `/leads` Data Table.
- `[ ]` Implement `/leads/new` form.
- `[ ]` Implement `/leads/[id]` detail view.
- `[ ]` Ensure organizations have default Statuses/Sources upon creation.
- `[ ]` Update `PROJECT_TRACKER.md` on completion.

## Implementation Rules

- DTOs and Services must be used; never call Prisma directly from UI components.
- Enforce permissions: Owners/Admins can see/edit all; Members can only edit assigned leads.
- Do not delete leads directly; use the `deletedAt` soft-delete field.
