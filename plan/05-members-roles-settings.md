# Plan 05: Members, Roles & Settings

## Objective

Build personal profile settings, member management, invitations, role assignments, and basic organization settings — end-to-end with UI and backend.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete
- Current task: Closed — invite/role/remove/org update wired; Members in account-foot popper.
- Dependency: `03-app-shell-navigation`
- Next prompt after completion: restore active `06-leads-management`

## Navigation (locked)

- Profile + Members + Organization: sidebar **account foot popper**
- Main nav: Dashboard + Leads only
- No nested settings sidebar

## Task Checklist

- `[x]` Profile settings (`/settings/profile`) via Better Auth `updateUser`
- `[x]` Seed default Admin/Manager/Member roles with permission sets
- `[x]` Invitation create / email / resend / revoke
- `[x]` Accept invite on signup (auth hook) and `/invite/[token]`
- `[x]` Member role update + remove with authz guards
- `[x]` Organization name update (slug read-only)
- `[x]` Unit tests + validation
- `[x]` Update `PROJECT_TRACKER.md` / `AGENTS.md`; mark plan `[x]`; restore Plan 06

## Implementation Rules

- Follow RBAC docs: permission checks via `createAuthorizationService`
- Server Actions + services + repositories + DTOs (Zod)
- Invite tokens: secure, single-use, 7-day expiry
- Owner cannot be removed; Owner role not assignable via invite
