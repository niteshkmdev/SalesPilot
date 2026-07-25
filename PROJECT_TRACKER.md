# SalesPilot Project Tracker

This file is the root handoff index for the SalesPilot build. Every agent must read this file before planning or implementing work.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current State

- Active plan: None; `01-core-foundation` is complete.
- Current task: Start `02-auth-onboarding` by creating `plan/02-auth-onboarding.md` from `prompt/02-auth-onboarding.md`.
- Next prompt after active plan: `prompt/03-app-shell-navigation.md`
- Last updated: 2026-07-25

## Plan Index

| # | Status | Plan | Dependency | Plan File | Prompt File | Next Plan |
|---|---|---|---|---|---|---|
| 01 | `[x]` | Core Foundation | None | `plan/01-core-foundation.md` | `prompt/01-core-foundation.md` | 02 Auth & Onboarding |
| 02 | `[ ]` | Auth & Onboarding | 01 Core Foundation | `plan/02-auth-onboarding.md` | `prompt/02-auth-onboarding.md` | 03 App Shell & Navigation |
| 03 | `[ ]` | App Shell & Navigation | 02 Auth & Onboarding | `plan/03-app-shell-navigation.md` | `prompt/03-app-shell-navigation.md` | 04 Marketing Landing Page |
| 04 | `[ ]` | Marketing Landing Page | 03 App Shell & Navigation | `plan/04-marketing-landing-page.md` | `prompt/04-marketing-landing-page.md` | 05 Members, Roles & Settings |
| 05 | `[ ]` | Members, Roles & Settings | 03 App Shell & Navigation | `plan/05-members-roles-settings.md` | `prompt/05-members-roles-settings.md` | 06 Leads Management |
| 06 | `[ ]` | Leads Management | 05 Members, Roles & Settings | `plan/06-leads-management.md` | `prompt/06-leads-management.md` | 07 Dashboard v1 |
| 07 | `[ ]` | Dashboard v1 | 06 Leads Management | `plan/07-dashboard-v1.md` | `prompt/07-dashboard-v1.md` | 08 Custom Fields |
| 08 | `[ ]` | Custom Fields | 06 Leads Management | `plan/08-custom-fields.md` | `prompt/08-custom-fields.md` | 09 Lead Forms & Public Submissions |
| 09 | `[ ]` | Lead Forms & Public Submissions | 08 Custom Fields | `plan/09-lead-forms-public-submissions.md` | `prompt/09-lead-forms-public-submissions.md` | 10 Search |
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

1. Read `AGENTS.md`.
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
