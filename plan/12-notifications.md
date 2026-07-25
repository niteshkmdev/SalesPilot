# Plan 12: Notifications

## Objective

In-app notifications for lead assignment and status changes, delivered via header bell with TanStack Query polling (no websockets). Joint wave with Plan 11.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete (joint wave with Plan 11)
- Current task: Closed — notifications module, `/notifications` center, header bell with badge
- Dependency: Plan 11 activity (same wave)
- Next after joint wave: `prompt/13-storage-attachments.md`

## Assumptions / deviations

1. In-app only (no email).
2. Polling: unread badge every 30s; list every 15s on the notification center page.
3. Notify on assign → new assigned member and/or manager (skip actor / cleared).
4. Notify on status change → current assigned member only (skip actor / unassigned).
5. Types: `LEAD_ASSIGNED` / `LEAD_UPDATED` (existing enum).
6. Users only access their own notifications.
7. Header: New Lead button removed; bell links to `/notifications` with unread badge.

## Task Checklist

- `[x]` Draft plan (joint with 11)
- `[x]` Notifications module (dto/repo/service)
- `[x]` Side-effects from lead assign/status
- `[x]` Header NotificationBell + polling badge → `/notifications`
- `[x]` Notification center page (mark read / mark all)
- `[x]` Unit tests
- `[x]` Update tracker on completion

## Out of scope

- Email / push / websockets
- Invitation / role / org notification types
- Notification preferences
- Sidebar Notifications nav item (header bell is the entry)
