# Plan 01: Core Foundation

## Objective

Build the SalesPilot foundation required before feature UI work: documented database schema, request context, auth facade, organization provisioning, RBAC, API response helpers, DTO boundaries, and test setup.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete (re-audit fix pass done)
- Current task: Complete. Resume Plan 06 leads work. Auth Service login/register wrappers intentionally deferred (Better Auth client).
- Dependency: None
- Next prompt after completion: Plan 06 deferred debt + `prompt/07-dashboard-v1.md` when leads done.

## Required Docs

- `[x]` `docs/00-project-overview.md`
- `[x]` `docs/01-product-requirements`
- `[x]` `docs/02-architecture.md`
- `[x]` `docs/03-folder-structure.md`
- `[x]` `docs/04-tech-stack.md`
- `[x]` `docs/05-design-system.md`
- `[x]` `docs/06-database-schema.md`
- `[x]` `docs/07-authentication.md`
- `[x]` `docs/08-rbac.md`
- `[x]` `docs/09-api-specification.md`
- `[x]` `docs/10-landing-page.md`
- `[x]` `docs/11-onboarding.md`
- `[x]` `docs/12-dashboard.md`
- `[x]` `docs/13-leads.md`
- `[x]` `docs/14-lead-forms.md`
- `[!]` `docs/15-custom-fields.md` is empty; use database/API docs and existing implementation until this doc is populated.
- `[x]` `docs/16-notifications.md`
- `[x]` `docs/17-search.md`
- `[x]` `docs/18-storage.md`
- `[x]` `docs/19-activity.md`
- `[x]` `docs/20-dashboard.md`
- `[x]` `docs/21-rbac-implementation.md`
- `[x]` `docs/22-authentication-implementation.md`
- `[x]` `docs/23-organizations-multi-tenancy.md`
- `[x]` `docs/24-api-standards.md`
- `[x]` `docs/25-database-schema.md`
- `[x]` `docs/26-testing-strategy.md`
- `[x]` `docs/27-deployment-infrastructure.md`
- `[x]` `docs/28-coding-standards.md`
- `[x]` `docs/29-roadmap-future-enhancements.md`
- `[x]` Relevant Next.js docs in `node_modules/next/dist/docs/` before framework-specific behavior.

## Task Checklist

- `[x]` Read all numbered docs in `docs/`.
- `[x]` Read relevant installed Next.js docs before route or middleware work.
- `[x]` Expand `prisma/schema.prisma` with documented business models.
- `[x]` Keep Better Auth generated models unchanged unless required.
- `[x]` Use `cuid(2)` IDs for new business collections.
- `[x]` Add central permission registry using `resource.action` names.
- `[x]` Add organization provisioning service for first verified user setup.
- `[x]` Add organization repository with tenant-safe persistence methods.
- `[x]` Add member repository and role/permission repositories (`role.repository.ts`, `createMember` in member repo).
- `[x]` Add seeded defaults for permissions, owner role, lead statuses, lead sources, and branding.
- `[x]` Add Auth Service wrapper around Better Auth (session/user/logout only; login/register stay on Better Auth client).
- `[x]` Add app-context resolver for user, organization, member, and permissions (load-only; domain types; no Prisma leaks).
- `[x]` Add Authorization Service with `can`, `canAll`, and `canAny`.
- `[x]` Add standard API success and error envelope helpers.
- `[x]` Add validation error mapping for Zod errors.
- `[x]` Domain context types (no `@prisma/client` in OrganizationContext); API DTOs remain for responses.
- `[x]` Add Vitest configuration and test scripts.
- `[x]` Focused unit tests for auth context, authorization, API helpers, and provisioning (load-only context).
- `[x]` Env access only via `src/server/env.ts`.
- `[x]` AppShell + onboarding load-only; Better Auth hook sole auto-provision; unverified → `/verify`.
- `[x]` Update `PROJECT_TRACKER.md` after each meaningful task.
- `[x]` Mark this plan complete in `PROJECT_TRACKER.md`.

## Validation Checklist

- `[x]` Run `npx prisma validate`.
- `[x]` Regenerate Prisma client after schema changes.
- `[x]` Run `npm run lint`.
- `[x]` Run `npm run test`.
- `[x]` Run `npm run build`.

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
| 2026-07-25 | Codex | Completed the core doc pass for this slice, expanded the Prisma schema with documented business collections, validated the schema, and regenerated the Prisma client. |
| 2026-07-25 | Codex | Added core services, repositories, DTOs, permission registry, authorization service, and API response helpers. TypeScript passes with `npx tsc --noEmit`. |
| 2026-07-25 | Codex | Added Vitest, configured unit tests, and verified `npm run test` passes. |
| 2026-07-25 | Codex | Completed lint and production build validation. Fixed the root layout toaster placement so Sonner renders inside `<body>`. |
| 2026-07-25 | Codex | Resolved Prisma v7 + MongoDB build incompatibility by using Prisma v6.19.3 and the `prisma-client-js` generator. |
| 2026-07-25 | Codex | Marked the core foundation plan complete and opened `prompt/02-auth-onboarding.md` for the next slice. |
| 2026-07-25 | Auto | Re-opened for fix pass: env leaks, Prisma in OrganizationContext, missing role repo, duplicate provision in AppShell/onboarding, unverified email not redirected. |
| 2026-07-25 | Auto | Fix pass complete: env routed through `env.ts`; domain OrganizationContext + roleName; role/member repos split; requireAppContext load-only; AppShell redirects (login/verify/onboarding); onboarding no longer provisions. Tests 10/10; lint/build green. |

## Changed Files Log

| Date | Files | Notes |
|---|---|---|
| 2026-07-25 | `PROJECT_TRACKER.md`, `plan/01-core-foundation.md`, `prompt/*.md` | Added persistent tracking and handoff prompts. |
| 2026-07-25 | `prisma/schema.prisma`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | Added business schema models and generated Prisma Client with Prisma v6.19.3 for MongoDB support. |
| 2026-07-25 | `src/modules/auth/*`, `src/modules/organizations/*`, `src/modules/permissions/*`, `src/shared/api/*`, `src/server/db/types.ts` | Added core foundation services, repositories, DTOs, and API helpers. |
| 2026-07-25 | `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`, `tests/unit/*` | Added Vitest tooling and focused unit tests. |
| 2026-07-25 | `src/app/layout.tsx`, `src/components/ui/sonner.tsx` | Fixed hydration issue by ensuring the Sonner toaster renders inside `<body>`. |
| 2026-07-25 | `src/server/env.ts` consumers, `OrganizationContext`, repos, AppShell, onboarding, unit tests | Core foundation re-audit: env-only access, domain context, role repo, load-only shell/onboarding, verify redirect. |

## Blockers

- `docs/15-custom-fields.md` is empty. Use `docs/25-database-schema.md`, `docs/09-api-specification.md`, and neighboring feature patterns until a custom-fields spec is added.
- Deferred to Plan 06: leads under `src/server/{services,repositories,dto}` instead of `modules/leads`; role-string authz; ad-hoc server-action envelopes vs `src/shared/api`.

## Next Prompt

- Resume Plan 06 (`plan/06-leads-management.md`). When leads are done, open `prompt/07-dashboard-v1.md`.
