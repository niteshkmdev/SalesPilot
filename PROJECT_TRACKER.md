# SalesPilot Project Tracker

This file is the root handoff index for the SalesPilot build. Every agent must read this file before planning or implementing work.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current State

- Active plan: none (08 + 09 complete). Next: `prompt/10-search.md`
- Current task: Open `prompt/10-search.md` and create `plan/10-search.md`.
- Deferred: `07-dashboard-v1` (until activity/notifications; dashboard remains sample data)
- Last updated: 2026-07-25

## Plan Index

| # | Status | Plan | Dependency | Plan File | Prompt File | Next Plan |
|---|---|---|---|---|---|---|
| 01 | `[x]` | Core Foundation | None | `plan/01-core-foundation.md` | `prompt/01-core-foundation.md` | 02 Auth & Onboarding |
| 02 | `[x]` | UI-First Pages | 01 Core Foundation | `plan/02-ui-first-pages.md` | `prompt/02-ui-first-pages.md` | 17 Backend Implementation |
| 03 | `[x]` | App Shell & Navigation | 02 Auth & Onboarding | `plan/03-app-shell-navigation.md` | `prompt/03-app-shell-navigation.md` | 04 Marketing Landing Page |
| 04 | `[x]` | Marketing Landing Page | 03 App Shell & Navigation | `plan/04-marketing-landing-page.md` | `prompt/04-marketing-landing-page.md` | 05 Members, Roles & Settings |
| 05 | `[x]` | Members, Roles & Settings | 03 App Shell & Navigation | `plan/05-members-roles-settings.md` | `prompt/05-members-roles-settings.md` | 06 Leads Management |
| 06 | `[x]` | Leads Management | 05 Members, Roles & Settings | `plan/06-leads-management.md` | `prompt/06-leads-management.md` | 07 Dashboard v1 |
| 07 | `[~]` | Dashboard v1 (deferred) | 06 Leads Management | `plan/07-dashboard-v1.md` | `prompt/07-dashboard-v1.md` | 08 Custom Fields |
| 08 | `[x]` | Custom Fields | 06 Leads Management | `plan/08-custom-fields.md` | `prompt/08-custom-fields.md` | 09 Lead Forms & Public Submissions |
| 09 | `[x]` | Lead Forms & Public Submissions | 08 Custom Fields | `plan/09-lead-forms-public-submissions.md` | `prompt/09-lead-forms-public-submissions.md` | 10 Search |
| 10 | `[ ]` | Search | 06 Leads Management | `plan/10-search.md` | `prompt/10-search.md` | 11 Activity Timeline |
| 11 | `[ ]` | Activity Timeline | 06 Leads Management | `plan/11-activity-timeline.md` | `prompt/11-activity-timeline.md` | 12 Notifications |
| 12 | `[ ]` | Notifications | 11 Activity Timeline | `plan/12-notifications.md` | `prompt/12-notifications.md` | 13 Storage & Attachments |
| 13 | `[ ]` | Storage & Attachments | 06 Leads Management | `plan/13-storage-attachments.md` | `prompt/13-storage-attachments.md` | 14 Branding & Organization Settings |
| 14 | `[ ]` | Branding & Organization Settings | 05 Members, Roles & Settings | `plan/14-branding-organization-settings.md` | `prompt/14-branding-organization-settings.md` | 15 Testing & Quality Hardening |
| 15 | `[ ]` | Testing & Quality Hardening | 01-14 MVP plans | `plan/15-testing-quality-hardening.md` | `prompt/15-testing-quality-hardening.md` | 16 Deployment & Production Readiness |
| 16 | `[ ]` | Deployment & Production Readiness | 15 Testing & Quality Hardening | `plan/16-deployment-production-readiness.md` | `prompt/16-deployment-production-readiness.md` | 99 Future Roadmap |
| 99 | `[ ]` | Future Roadmap | 16 Deployment & Production Readiness | `plan/99-future-roadmap.md` | `prompt/99-future-roadmap.md` | None |

## Global Tracking Rules

- Update this tracker after every meaningful implementation step.
- Update the active `plan/*.md` file at the same time as this tracker.
- Do not mark a plan `[x]` until its validation checklist is complete or documented as intentionally skipped.
- If limits are exhausted, mark the current task `[~]` or `[!]` and write the exact next action.
- Do not delete completed tasks or logs. Append new entries to preserve handoff history.

## Required Agent Startup

Every new agent must:

1. Read `AGENTS.md` (including **Plan Index Re-check Status**).
2. Read this `PROJECT_TRACKER.md`.
3. Read the active `plan/*.md`.
4. Read the prompt for the next required planning phase only when the active plan is complete.
5. Read all relevant project docs before changing code.
6. Follow the documented architecture: Server Components by default, services for business logic, repositories for CRUD only, DTOs for API responses, Zod validation, Better Auth, Prisma, and server-side authorization.

## Progress Log

| Date | Agent | Update |
|---|---|---|
| 2026-07-25 | Codex | Created root tracker structure and marked `01-core-foundation` as active. |
| 2026-07-25 | Codex | Expanded the Prisma schema with core business models, validated it, and regenerated the Prisma client. |
| 2026-07-25 | Codex | Added core permission registry, organization repositories, provisioning service, auth wrapper, app context resolver, authorization service, DTO mappers, and API helpers. |
| 2026-07-25 | Codex | Added Vitest setup, package scripts, and focused unit tests. `npm run test` passes with 4 files and 7 tests. |
| 2026-07-25 | Codex | Completed core validation: `npx prisma validate`, Prisma client generation, `npx tsc --noEmit`, `npm run lint`, `npm run test`, and `npm run build` pass. |
| 2026-07-25 | Codex | Resolved the Prisma v7 + MongoDB build blocker by pinning Prisma packages to v6.19.3 and using `prisma-client-js`; fixed the root layout toaster hydration error. |
| 2026-07-25 | Codex | Marked `01-core-foundation` complete. Next action is to open `prompt/02-auth-onboarding.md` and create `plan/02-auth-onboarding.md`. |
| 2026-07-25 | Codex | User pivoted execution order to UI-first: marketing, dashboard, and visible app pages before backend/auth implementation. |
| 2026-07-25 | Codex | Created `plan/02-ui-first-pages.md`, added `prompt/17-backend-implementation.md`, added shadcn UI primitives, and built initial `/` and `/dashboard` static UI. |
| 2026-07-25 | Codex | Handoff written per user request. `npm run lint` passes; `npm run build` was interrupted for handoff. Next UI pages are Login and Signup. |
| 2026-07-25 | Antigravity | Implemented static Login and Signup UI pages. Added logic for conditional org creation in signup UI based on invite query param. Next task: remaining app UI pages. |
| 2026-07-25 | Antigravity | Wired Login and Signup UI with Better Auth client. Added Google OAuth buttons and a new `/onboarding` flow to capture missing Organization info for Google signups. |
| 2026-07-25 | Antigravity | Resolved MongoDB malformed ObjectId error caused by Better Auth generating string IDs. Updated Prisma schema. |
| 2026-07-25 | Antigravity | Completed plan 02. Drafted implementation plan for App Shell & Navigation (Plan 03) and awaiting user approval. |
| 2026-07-25 | Antigravity | Completed plan 03: App Shell, sidebar, role-aware navigation. Skipped plan 04 (already done). Drafted plan 05 for Settings & Members. |
| 2026-07-25 | Antigravity | Completed plan 05: Profile Settings, Organization Settings, and Member Management UI. Drafted plan 06 for Leads Management. |
| 2026-07-25 | Auto | Shell/auth fix pass: consolidated mock dashboard chrome into real AppShell (280px sticky sidebar, org+search+New Lead header, richer user menu); stripped nested `/dashboard` shell; session-aware marketing CTAs; auth back/home chrome; onboarding org rename action; nav hygiene (Members → `/settings/members`, hide unfinished Forms/Branding/Notifications). Demoted plan 05 to `[~]` (invite/org edit still stubs). |
| 2026-07-25 | Auto | Leads polish: Card-based create/edit form with source + website; typed lead DTOs/mappers; status color resolution; list filters (search, status, source); improved detail view. Assignment UI still open. |
| 2026-07-25 | Auto | Re-opened Plan 01 for core foundation fix pass (env, domain context, role repo, load-only shell/onboarding, verify redirect). Temporarily paused Plan 06 as active. |
| 2026-07-25 | Auto | Plan 01 re-audit complete: env via `env.ts`, domain OrganizationContext + roleName, role/member repos split, Better Auth hook sole provisioner, AppShell/onboarding load-only, unverified → `/verify`. Validation green. Deferred to Plan 06: leads under `src/server/*`, role-string authz, ad-hoc action envelopes. Restored Plan 06 as active. |
| 2026-07-25 | Auto | Re-opened Plan 02 for UI-first close-out (landing copy, forgot-password, verify typing, dashboard honesty). Temporarily paused Plan 06. |
| 2026-07-25 | Auto | Plan 02 close-out complete: landing FAQ honesty, `/forgot-password` + `/reset-password`, typed verify resend, dashboard sample-data + New Lead CTA. Carve-outs: invite/org edit → 05; assignment → 06; live dashboard → 07; forms → 09; notifications → 12. Restored Plan 06 as active. |
| 2026-07-25 | Auto | Re-opened Plan 03 for app shell close-out (auth chrome, nav hygiene, loading/error). Temporarily paused Plan 06. |
| 2026-07-25 | Auto | Plan 03 close-out complete: route-aware AuthChrome, Members top-level only, primary active nav, honest search copy, dashboard loading/error, nav unit tests, login forgot-password below field. Restored Plan 06 as active. |
| 2026-07-25 | Auto | Plan 02 follow-up: public `/terms` and `/privacy` pages (draft MVP copy) for Google OAuth verification; consent links on signup/login. Active plan remains `06-leads-management`. |
| 2026-07-25 | Auto | Brand/PWA/social meta: SalesPilotMark SVG logo in marketing/auth/shell, favicon+PWA icons, `manifest.ts` (`start_url` `/dashboard`), minimal SW, OG 630 + Twitter 628 Hero images. Active plan remains `06-leads-management`. |
| 2026-07-25 | Auto | Brand mark polish: in-app SVG = black squircle + white S (transparent outside); favicon/PWA = same mark on white canvas; larger `SalesPilotBrandLink` lockup with `select-none`. Active plan remains `06-leads-management`. |
| 2026-07-25 | Auto | Documented Plan Index re-check outcomes in `AGENTS.md` (01–03 closed/re-checked; 04 partial; 05–06 `[~]` with open points; 07+ not started). Active plan remains `06-leads-management`. |
| 2026-07-25 | Auto | Re-opened Plan 04 marketing landing revalidation (create plan file, product-complete copy, Hero.png). Temporarily paused Plan 06. |
| 2026-07-25 | Auto | Plan 04 complete: product-complete landing copy, `/Hero.png` hero + product preview, FAQ accordion (no static-data claims), final CTA. Restored Plan 06 as active. |
| 2026-07-25 | Auto | Re-opened Plan 05 members/roles/settings end-to-end (invite, roles, org update). Temporarily paused Plan 06. |
| 2026-07-25 | Auto | Plan 05 complete: default roles, invite/resend/revoke + `/invite/[token]` accept, member role/remove, org name update; Members moved to account-foot popper. Restored Plan 06 as active. |
| 2026-07-25 | Auto | Plan 06 complete: leads domain in `src/modules/leads/`; `Permissions.LEAD_*` + `requireAppContext`; assignment UI; expanded filters; pagination/sorting; soft-delete UI; duplicate-flag foundations; unit tests. `tsc`, lint, tests green. Next: `prompt/07-dashboard-v1.md`. |
| 2026-07-25 | Auto | Leads follow-up: Members limited to status/notes (`LEAD_UPDATE` + ownership); full edit gated by `LEAD_ASSIGN`/`canEditFull`; dual Assigned manager/member columns with role pools; detail Status/Notes dialogs; edit page redirect without `canEditFull`. |
| 2026-07-25 | Auto | Lead role visibility: Member sees assigned-member leads only; Manager sees assigned member/manager; Owner/Admin org-wide; create auto-assigns Members; `syncSystemRolePermissions` + `npm run roles:sync`; AGENTS role-scope section. |
| 2026-07-25 | Auto | Deferred Plan 07 (dashboard) intentionally. Started joint Plan 08+09: custom fields + public lead forms. |
| 2026-07-25 | Auto | Plans 08+09 complete: custom fields module + settings UI + lead values; lead forms admin + public `/forms/[orgSlug]/[formSlug]` submit (Turnstile, activity row). Admin editor at `/forms/edit/[id]` to avoid slug param conflict. Next: `prompt/10-search.md`. |
