# Plan 02: Auth & Onboarding

## Objective

Plan and then build login, registration, email verification handling, protected route behavior, first-user onboarding, organization setup flow, and dashboard redirect behavior using Better Auth and the core foundation.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete
- Current task: Handoff to next task (`03-app-shell-navigation`).
- Dependency: `02-ui-first-pages`
- Next prompt after completion: `prompt/03-app-shell-navigation.md`

## Task Checklist

- `[x]` Read docs (`docs/11-onboarding.md`, `docs/07-authentication.md`, `docs/22-authentication-implementation.md`).
- `[x]` Draft implementation plan for Login/Signup wiring and Google OAuth.
- `[x]` Get plan approval from user.
- `[x]` Create `src/lib/auth-client.ts`.
- `[x]` Wire `login-page.tsx` with Better Auth (Email/Google).
- `[x]` Wire `signup-page.tsx` with Better Auth (Multi-step + Google).
- `[x]` Create `/onboarding` route for Google signups to complete org creation.
- `[x]` Update `PROJECT_TRACKER.md`.

## Implementation Rules

- Business modules should never communicate directly with Better Auth (use `AuthService` on server).
- Onboarding for Google users should capture missing org data before letting them use the app.
- Email verification is required for email/password signups.
