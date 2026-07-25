# Plan 05: Members, Roles & Settings

## Objective

Build personal profile settings, member management, invitations, role assignments, and basic organization settings.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[~]` In progress
- Current task: Get user approval on the implementation plan.
- Dependency: `03-app-shell-navigation` (and `04` skipped)
- Next prompt after completion: `prompt/06-leads-management.md`

## Task Checklist

- `[x]` Draft implementation plan for Members & Settings (including Header Profile enhancement).
- `[x]` Get plan approval from user.
- `[x]` Update `AppShell` and `Header` to use `user.image` with Shadcn `Avatar`.
- `[x]` Create `/settings` layout with sidebar/tabs for settings navigation.
- `[x]` Implement `/settings/profile` for personal user details (Name edit, Email read-only).
- `[x]` Implement `/settings/members` to list organization members and allow invitations (Admin only).
- `[x]` Implement `/settings/organization` for org basic details.
- `[x]` Update `PROJECT_TRACKER.md` on completion.

## Implementation Rules

- Follow RBAC docs: only Admin/Owner can manage members or organization settings.
- Use Better Auth `authClient.updateUser` for personal profile updates.
- Real API calls should use tRPC or Server Actions (we will use Next.js Server Actions or Route Handlers with DTO validation as per `docs/02-architecture.md`).
