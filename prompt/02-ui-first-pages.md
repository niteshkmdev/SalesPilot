# Prompt 02: UI-First Pages

You are planning or implementing the SalesPilot UI-first page build.

## Startup

- Read `AGENTS.md`.
- Read `PROJECT_TRACKER.md`.
- Read `plan/01-core-foundation.md`.
- Read `plan/02-ui-first-pages.md`.
- Read `docs/00-project-overview.md`, `docs/03-folder-structure.md`, `docs/04-tech-stack.md`, `docs/05-design-system.md`, `docs/10-landing-page.md`, `docs/12-dashboard.md`, `docs/20-dashboard.md`, and `docs/28-coding-standards.md`.
- Read relevant installed Next.js docs before route, layout, navigation, loading, or metadata work.
- Read shadcn guidance and inspect installed components before composing UI.

## Goal

Complete the static UI for the public marketing experience and authenticated application surfaces before backend wiring. Use realistic static data and keep auth, API, database, and mutation work deferred.

## Immediate Resume Task

- Build static Login and Signup pages next.
- Suggested routes: `src/app/(auth)/login/page.tsx` and `src/app/(auth)/signup/page.tsx`.
- Suggested components: `src/modules/auth/components/login-page.tsx` and `src/modules/auth/components/signup-page.tsx`.
- Do not wire Better Auth, server actions, API calls, redirects, or database reads during this UI-first pass.

## Tracker Requirements

- Update `plan/02-ui-first-pages.md` after each meaningful UI step.
- Update `PROJECT_TRACKER.md` with active task, status, blockers, and next plan.
- End by opening `prompt/17-backend-implementation.md` only after UI pages are complete.
