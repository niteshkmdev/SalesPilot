# Plan 07: Dashboard v1

## Objective

Live, role-scoped dashboard metrics with week/month/year/custom date ranges, wired into the existing dashboard layout. Shared shadcn Calendar date-range picker also used in Leads filters.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete
- Current task: Closed — live dashboard + shared date picker
- Dependency: Plans 06 (leads), 11 (activity), 12 (notifications)
- Next: `prompt/15-testing-quality-hardening.md` (or Storage revisit)

## Assumptions / deviations

1. Date presets: This week / This month / This year / Custom (default this month) — not the longer docs list.
2. Assigned Leads “Value” column → **Updated** (no deal-amount field on Lead).
3. Aggregates use `createdAt` in range + `buildLeadVisibilityWhere`.
4. Aggregated service + `GET /api/v1/dashboard`; RSC page loads service directly.

## Task Checklist

- `[x]` Shared date helpers + shadcn Calendar + DateRangePicker
- `[x]` Dashboard DTOs/service/aggregates + API
- `[x]` Wire `/dashboard` (remove sample data)
- `[x]` Leads filter sheet uses shared picker
- `[x]` Unit tests + tracker/AGENTS

## Out of scope

- Extra docs presets (Today / Last 7 / Last 30)
- Deal value / source chart
- Widget layout personalization
