# Plan 03: App Shell & Navigation

## Objective

Plan and build the protected CRM shell, responsive navigation, role-aware menu visibility, loading/error states, and reusable layout primitives.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete
- Current task: Shell consolidated with mock design (sticky 280px sidebar, rich header). Nested dashboard chrome removed.
- Dependency: `02-auth-onboarding`
- Next prompt after completion: `prompt/04-marketing-landing-page.md`

## Task Checklist

- `[x]` Read docs (`docs/02-architecture.md`, `docs/03-folder-structure.md`, `docs/08-rbac.md`).
- `[x]` Draft implementation plan for App Shell.
- `[x]` Get plan approval from user.
- `[x]` Create `src/lib/navigation.ts` for role-aware links.
- `[x]` Implement `AppShell`, `Sidebar`, `Header`, and `MobileNav` components.
- `[x]` Add `src/app/(dashboard)/layout.tsx` to wrap the app shell and protect routes.
- `[x]` Update `PROJECT_TRACKER.md`.

## Implementation Rules

- Must enforce role-aware visibility (Frontend UI hiding is UX only, but must match docs).
- Responsive design: Side navigation on desktop, mobile sheet/hamburger menu on small screens.
- Server components should fetch session and role to avoid client-side loading flashes for layout structure.
