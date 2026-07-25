# Plan 02: UI-First Pages

## Objective

Build the visible SalesPilot product experience first: marketing landing page, dashboard shell, dashboard widgets, and static UI states using documented design rules. Backend wiring for later features continues under numbered plans 05–12.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete (close-out re-audit done)
- Current task: Complete. Resume Plan 06. `prompt/17-backend-implementation.md` superseded by plans 03–16.
- Dependency: `01-core-foundation`
- Next after completion: `plan/06-leads-management.md`

## Required Docs

- `[x]` `PROJECT_TRACKER.md`
- `[x]` `plan/01-core-foundation.md`
- `[x]` `docs/00-project-overview.md`
- `[x]` `docs/02-architecture.md`
- `[x]` `docs/03-folder-structure.md`
- `[x]` `docs/04-tech-stack.md`
- `[x]` `docs/05-design-system.md`
- `[x]` `docs/10-landing-page.md`
- `[x]` `docs/12-dashboard.md`
- `[x]` `docs/20-dashboard.md`
- `[x]` `docs/28-coding-standards.md`
- `[x]` Relevant Next.js App Router docs for pages, layouts, route groups, links, and fonts.
- `[x]` shadcn project config and component guidance for Button, Card, Badge, Separator, Avatar, and Table.

## Task Checklist

- `[x]` Pivot tracker from backend-first to UI-first execution.
- `[x]` Add shadcn UI primitives needed for page composition.
- `[x]` Build marketing landing page at `/`.
- `[x]` Build static dashboard page at `/dashboard`.
- `[x]` Build static Login page UI (later wired to Better Auth).
- `[x]` Build static Signup page UI (including org creation rules).
- `[x]` App-shell/navigation — delivered under Plan 03.
- `[x]` Leads / members / settings / profile UI — delivered under Plans 05–06 (not static rebuild).
- `[x]` Close-out: landing FAQ honesty; forgot/reset password; verify typing; dashboard demo honesty.
- `[x]` Notifications + public lead forms — carved out to Plans 12 and 09.
- `[x]` Update `PROJECT_TRACKER.md` after each meaningful task.
- `[x]` Mark this plan complete in `PROJECT_TRACKER.md`.
- `[x]` Public `/terms` and `/privacy` pages for Google OAuth verification (draft MVP copy).

## Carve-outs (owned elsewhere)

- Settings invite + org edit save → Plan 05
- Lead assignment + `src/server` leads layout debt → Plan 06
- Live dashboard metrics → Plan 07
- Public lead forms → Plan 09
- Notifications page → Plan 12

## Validation Checklist

- `[x]` Run `npm run lint`.
- `[x]` Run `npm run build`.
- `[x]` Run `npm run test` (existing suite green during close-out).

## Implementation Rules

- Prefer Server Components unless browser interactivity is required.
- Use shadcn components and semantic Tailwind tokens.
- Keep pages thin; substantial UI lives in module components.
- Auth pages may use Better Auth client (already wired by later work).

## Progress Log

| Date | Agent | Update |
|---|---|---|
| 2026-07-25 | Codex | Created UI-first plan after user priority change: complete visible pages before backend implementation. |
| 2026-07-25 | Codex | Read UI-relevant docs, Next.js App Router docs, and shadcn guidance. Added Card, Badge, Separator, Avatar, and Table primitives. |
| 2026-07-25 | Codex | Built the static marketing landing page and static dashboard overview route with realistic UI demo data. |
| 2026-07-25 | Codex | Fixed Radix Slot client-boundary runtime issue by marking Button and Badge as Client Components. `npm run lint` passes. |
| 2026-07-25 | Codex | User requested handoff. Build was stopped before completion. Resume with static Login and Signup pages. |
| 2026-07-25 | Antigravity | Built static Login and Signup UI pages. Added logic for conditional org creation in signup UI based on invite query param. |
| 2026-07-25 | Auto | Re-opened for close-out re-audit: plan was stale; shell/settings/leads already exist under later plans. Scope = polish leftovers only. |
| 2026-07-25 | Auto | Close-out complete: FAQ copy, `/forgot-password` + `/reset-password`, typed verify resend, dashboard sample-data honesty. Lint/test/build green. |
| 2026-07-25 | Auto | Added public `/terms` and `/privacy` with draft MVP legal copy for Google OAuth verification; signup/login consent links. |

## Changed Files Log

| Date | Files | Notes |
|---|---|---|
| 2026-07-25 | `plan/02-ui-first-pages.md`, `PROJECT_TRACKER.md` | Added UI-first tracking plan and prepared project handoff state. |
| 2026-07-25 | `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/separator.tsx`, `src/components/ui/avatar.tsx`, `src/components/ui/table.tsx` | Added official shadcn primitives for static UI composition. |
| 2026-07-25 | `src/app/page.tsx`, `src/app/(dashboard)/dashboard/page.tsx`, `src/modules/marketing/components/landing-page.tsx`, `src/modules/dashboard/components/dashboard-page.tsx`, `src/app/layout.tsx`, `src/app/globals.css` | Added marketing and dashboard UI routes, product metadata, and Inter font token alignment. |
| 2026-07-25 | `src/components/ui/button.tsx`, `src/components/ui/badge.tsx` | Added `"use client"` because Radix Slot uses React context and cannot be imported through Server Components without a client boundary. |
| 2026-07-25 | `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, `src/modules/auth/components/login-page.tsx`, `src/modules/auth/components/signup-page.tsx`, `src/app/(auth)/layout.tsx` | Added static Login and Signup routes and components. |
| 2026-07-25 | `landing-page.tsx`, `forgot-password*`, `reset-password*`, `verify-page.tsx`, `login-page.tsx`, `dashboard-page.tsx`, trackers | UI-first close-out polish. |
| 2026-07-25 | `(marketing)/terms`, `(marketing)/privacy`, `legal.ts`, signup/login consent links | Terms & Privacy for OAuth verification. |

## Blockers

- None.

## Next Prompt

- Resume `plan/06-leads-management.md`.
