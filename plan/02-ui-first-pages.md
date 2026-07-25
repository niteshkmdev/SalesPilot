# Plan 02: UI-First Pages

## Objective

Build the visible SalesPilot product experience first: marketing landing page, dashboard shell, dashboard widgets, and static UI states using documented design rules. Backend wiring, authentication enforcement, mutations, and API integrations come after this UI pass.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[~]` In progress
- Current task: Build static Login and Signup UI pages next.
- Dependency: `01-core-foundation`
- Next prompt after completion: `prompt/17-backend-implementation.md`

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
- `[ ]` Build static Login page UI.
- `[ ]` Build static Signup page UI.
- `[ ]` Add app-shell/navigation UI pages after marketing/dashboard if scope continues.
- `[ ]` Add remaining static UI pages: leads, lead forms, members, settings, notifications, profile.
- `[ ]` Keep backend work deferred until the UI pass is marked complete.
- `[ ]` Update `PROJECT_TRACKER.md` after each meaningful task.
- `[ ]` Mark this plan complete in `PROJECT_TRACKER.md`.
- `[ ]` Open `prompt/17-backend-implementation.md` to begin backend wiring after UI completion.

## Validation Checklist

- `[x]` Run `npm run lint`.
- `[~]` Run `npm run build`; interrupted by user handoff request before completion.
- `[!]` `npm run test` intentionally skipped for now by user request.

## Implementation Rules

- Build UI with static/demo data only during this pass.
- Do not add backend route handlers, mutations, auth redirects, or database reads during this UI-first plan.
- Keep pages thin and move substantial UI into module-owned components.
- Prefer Server Components unless browser interactivity is required.
- Use shadcn components and semantic Tailwind tokens.
- Avoid raw colors, `space-*` utilities, and default admin-template styling.

## Progress Log

| Date | Agent | Update |
|---|---|---|
| 2026-07-25 | Codex | Created UI-first plan after user priority change: complete visible pages before backend implementation. |
| 2026-07-25 | Codex | Read UI-relevant docs, Next.js App Router docs, and shadcn guidance. Added Card, Badge, Separator, Avatar, and Table primitives. |
| 2026-07-25 | Codex | Built the static marketing landing page and static dashboard overview route with realistic UI demo data. |
| 2026-07-25 | Codex | Fixed Radix Slot client-boundary runtime issue by marking Button and Badge as Client Components. `npm run lint` passes. |
| 2026-07-25 | Codex | User requested handoff. Build was stopped before completion. Resume with static Login and Signup pages. |

## Changed Files Log

| Date | Files | Notes |
|---|---|---|
| 2026-07-25 | `plan/02-ui-first-pages.md`, `PROJECT_TRACKER.md` | Added UI-first tracking plan and prepared project handoff state. |
| 2026-07-25 | `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/separator.tsx`, `src/components/ui/avatar.tsx`, `src/components/ui/table.tsx` | Added official shadcn primitives for static UI composition. |
| 2026-07-25 | `src/app/page.tsx`, `src/app/(dashboard)/dashboard/page.tsx`, `src/modules/marketing/components/landing-page.tsx`, `src/modules/dashboard/components/dashboard-page.tsx`, `src/app/layout.tsx`, `src/app/globals.css` | Added marketing and dashboard UI routes, product metadata, and Inter font token alignment. |
| 2026-07-25 | `src/components/ui/button.tsx`, `src/components/ui/badge.tsx` | Added `"use client"` because Radix Slot uses React context and cannot be imported through Server Components without a client boundary. |

## Blockers

- None.

## Handoff

- Resume task: build static Login and Signup UI pages.
- Suggested routes: `src/app/(auth)/login/page.tsx` and `src/app/(auth)/signup/page.tsx`.
- Suggested components: `src/modules/auth/components/login-page.tsx` and `src/modules/auth/components/signup-page.tsx`.
- Keep this UI-first: use static forms and links only; do not wire Better Auth, server actions, API calls, redirects, or database reads yet.
- After Login and Signup pages, continue app UI pages: leads, lead forms, members, settings, notifications, and profile.
- Validation state: `npm run lint` passes; `npm run build` should be rerun after the auth pages are added; `npm run test` is skipped by user request.

## Next Prompt

- When UI pages are complete, open `prompt/17-backend-implementation.md`.
