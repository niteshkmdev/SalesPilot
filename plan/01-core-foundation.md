# Plan 01: Core Foundation

## Objective

Build the SalesPilot foundation required before feature UI work: documented database schema, request context, auth facade, organization provisioning, RBAC, API response helpers, DTO boundaries, and test setup.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[~]` In progress
- Current task: Read all numbered docs in `docs/` before implementation.
- Dependency: None
- Next prompt after completion: `prompt/02-auth-onboarding.md`

## Required Docs

- `[~]` `docs/00-project-overview.md`
- `[~]` `docs/01-product-requirements`
- `[~]` `docs/02-architecture.md`
- `[~]` `docs/03-folder-structure.md`
- `[~]` `docs/04-tech-stack.md`
- `[~]` `docs/05-design-system.md`
- `[~]` `docs/06-database-schema.md`
- `[~]` `docs/07-authentication.md`
- `[~]` `docs/08-rbac.md`
- `[~]` `docs/09-api-specification.md`
- `[~]` `docs/10-landing-page.md`
- `[~]` `docs/11-onboarding.md`
- `[~]` `docs/12-dashboard.md`
- `[~]` `docs/13-leads.md`
- `[~]` `docs/14-lead-forms.md`
- `[!]` `docs/15-custom-fields.md` is empty; use database/API docs and existing implementation until this doc is populated.
- `[~]` `docs/16-notifications.md`
- `[~]` `docs/17-search.md`
- `[~]` `docs/18-storage.md`
- `[~]` `docs/19-activity.md`
- `[~]` `docs/20-dashboard.md`
- `[~]` `docs/21-rbac-implementation.md`
- `[~]` `docs/22-authentication-implementation.md`
- `[~]` `docs/23-organizations-multi-tenancy.md`
- `[~]` `docs/24-api-standards.md`
- `[~]` `docs/25-database-schema.md`
- `[~]` `docs/26-testing-strategy.md`
- `[~]` `docs/27-deployment-infrastructure.md`
- `[~]` `docs/28-coding-standards.md`
- `[~]` `docs/29-roadmap-future-enhancements.md`
- `[ ]` Relevant Next.js docs in `node_modules/next/dist/docs/` before adding routes, middleware, or framework-specific behavior.

## Task Checklist

- `[~]` Read all numbered docs in `docs/`.
- `[ ]` Read relevant installed Next.js docs before route or middleware work.
- `[ ]` Expand `prisma/schema.prisma` with documented business models.
- `[ ]` Keep Better Auth generated models unchanged unless required.
- `[ ]` Use `cuid(2)` IDs for new business collections.
- `[ ]` Add central permission registry using `resource.action` names.
- `[ ]` Add organization provisioning service for first verified user setup.
- `[ ]` Add organization repository with tenant-safe persistence methods.
- `[ ]` Add member repository and role/permission repositories.
- `[ ]` Add seeded defaults for permissions, owner role, lead statuses, lead sources, and branding.
- `[ ]` Add Auth Service wrapper around Better Auth.
- `[ ]` Add app-context resolver for user, organization, member, and permissions.
- `[ ]` Add Authorization Service with `can`, `canAll`, and `canAny`.
- `[ ]` Add standard API success and error envelope helpers.
- `[ ]` Add validation error mapping for Zod errors.
- `[ ]` Add DTO mappers so Prisma models never leave repositories.
- `[ ]` Add Vitest configuration and test scripts.
- `[ ]` Add focused unit tests for auth context, authorization, API helpers, and provisioning.
- `[ ]` Update `PROJECT_TRACKER.md` after each meaningful task.
- `[ ]` Mark this plan complete in `PROJECT_TRACKER.md`.
- `[ ]` Open `prompt/02-auth-onboarding.md` to begin the next plan.

## Validation Checklist

- `[ ]` Run `npx prisma validate`.
- `[ ]` Regenerate Prisma client after schema changes.
- `[ ]` Run `npm run lint`.
- `[ ]` Run `npm run test`.
- `[ ]` Run `npm run build`.

## Implementation Rules

- Keep route handlers thin: authenticate, validate, call service, return response.
- Keep repositories persistence-only: CRUD, queries, transactions, no validation, no authorization, no notifications, no activities.
- Keep business logic in services.
- Resolve organization context from the authenticated session, never from client-provided organization IDs.
- Return DTOs only; never expose Prisma models.
- Never access `process.env` outside `src/server/env.ts`.
- Prefer Server Components; use Client Components only for interactivity or browser APIs.

## Progress Log

| Date | Agent | Update |
|---|---|---|
| 2026-07-25 | Codex | Created the core foundation tracking plan. Initial planning pass reviewed major docs, but future implementer must complete a deliberate doc pass before code changes. |

## Changed Files Log

| Date | Files | Notes |
|---|---|---|
| 2026-07-25 | `PROJECT_TRACKER.md`, `plan/01-core-foundation.md`, `prompt/*.md` | Added persistent tracking and handoff prompts. |

## Blockers

- `docs/15-custom-fields.md` is empty. Use `docs/25-database-schema.md`, `docs/09-api-specification.md`, and neighboring feature patterns until a custom-fields spec is added.

## Next Prompt

- When this plan is complete, open `prompt/02-auth-onboarding.md`.
