# Plan 03: App Shell & Navigation

## Objective

Plan and build the protected CRM shell, responsive navigation, role-aware menu visibility, loading/error states, and reusable layout primitives.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete (close-out re-audit done)
- Current task: Complete. Resume Plan 06.
- Dependency: `02-ui-first-pages` / auth flows
- Next after completion: `plan/06-leads-management.md`

## Task Checklist

- `[x]` Read docs (`docs/02-architecture.md`, `docs/03-folder-structure.md`, `docs/08-rbac.md`).
- `[x]` Draft implementation plan for App Shell.
- `[x]` Get plan approval from user.
- `[x]` Create `src/lib/navigation.ts` for role-aware links.
- `[x]` Implement `AppShell`, `Sidebar`, `Header`, and `MobileNav` components.
- `[x]` Add `src/app/(dashboard)/layout.tsx` to wrap the app shell and protect routes.
- `[x]` Close-out: route-aware AuthChrome; Members nav dupe fix; primary active style; honest search copy; loading/error; nav tests; onboarding Log out on rename.
- `[x]` Update `PROJECT_TRACKER.md`.
- `[x]` Mark plan complete.

## Carve-outs

- Live search → Plan 10
- Forms / Branding / Notifications nav → Plans 09 / 14 / 12
- Settings invite + org edit → Plan 05
- Collapsed 72px sidebar, header notifications bell → defer

## Validation Checklist

- `[x]` Run `npm run lint`.
- `[x]` Run `npm run test`.
- `[x]` Run `npm run build`.

## Implementation Rules

- Must enforce role-aware visibility (Frontend UI hiding is UX only, but must match docs).
- Responsive design: Side navigation on desktop, mobile sheet/hamburger menu on small screens.
- Server components should fetch session and role to avoid client-side loading flashes for layout structure.

## Progress Log

| Date | Agent | Update |
|---|---|---|
| 2026-07-25 | Antigravity | Completed shell, sidebar, role-aware navigation. |
| 2026-07-25 | Auto | Shell/auth fix pass consolidated mock chrome into AppShell. |
| 2026-07-25 | Auto | Re-opened for close-out: auth back chrome inconsistency, Members dupe, missing loading/error, search copy. |
| 2026-07-25 | Auto | Close-out complete: AuthChrome, nav hygiene, loading/error, nav tests. Login forgot-password moved below password for tab order. |

## Changed Files Log

| Date | Files | Notes |
|---|---|---|
| 2026-07-25 | `auth-chrome.tsx`, `(auth)/layout.tsx`, onboarding/verify, `navigation.ts`, sidebar/mobile/header, `(dashboard)/loading.tsx`, `error.tsx`, `tests/unit/lib/navigation.test.ts`, `login-page.tsx` | Plan 03 close-out. |
