<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# SalesPilot AI Development Guide

This document defines how AI coding agents should work on this repository.

---

## Read Before Writing Code

Before implementing any feature, read the documentation in this order.

1. docs/00-project-overview.md
2. docs/02-architecture.md
3. docs/03-folder-structure.md
4. docs/04-tech-stack.md
5. docs/05-design-system.md
6. docs/24-api-standards.md
7. docs/25-database-schema.md
8. docs/28-coding-standards.md

Then read the feature-specific document (Leads, Dashboard, Forms, etc.) before making changes.

Never skip these documents.

---

# Next.js Version Notice

This project uses the latest version of Next.js.

Do not assume APIs, conventions, or project structure from your training data.

Before implementing any Next.js feature, read the relevant documentation under

node_modules/next/dist/docs/

and follow the current APIs and deprecation guidance.

If the documentation conflicts with prior knowledge, always follow the documentation.

---

# Architecture Rules

Follow the documented architecture exactly.

- Server Components by default
- Client Components only when required
- Vertical Slice Architecture
- Service Layer
- Repository Pattern
- DTOs for API responses
- Zod validation
- React Hook Form
- TanStack Query for server state
- Better Auth for authentication
- Prisma for database access

Do not introduce new architectural patterns unless explicitly requested.

---

# Before Coding

Understand the feature first.

Review:

- related documentation
- existing implementation
- neighboring modules

Do not immediately start writing code.

---

# Code Quality

Write production-ready code.

Avoid placeholders.

Avoid TODO implementations.

Avoid mock implementations unless explicitly requested.

Complete the feature fully.

---

# Preserve Consistency

Follow existing

- naming
- folder structure
- component structure
- import ordering
- styling
- API conventions

Never introduce inconsistent patterns.

---

# Before Creating New Files

Ask yourself:

- Does something similar already exist?
- Can an existing abstraction be reused?
- Is this aligned with the architecture?

Prefer extending existing modules over creating new ones.

---

# UI Rules

Follow the Design System documentation.

Never invent spacing, typography, or colors.

Use existing UI components whenever possible.

Accessibility is required.

## Dashboard page layout (Leads pattern)

New and updated dashboard modules must follow the **Leads** layout as the canonical pattern.

- Full-width list pages (no narrow `max-w-*` shells on tables). Use `max-w-4xl` only for focused create/edit forms, like lead new/edit.
- Shared [`PageHeader`](src/components/layout/page-header.tsx): ghost back link + title/subtitle + action cluster (detail/edit). List pages usually omit the back link.
- List pages: title row + search toggle + filters + primary CTA + bordered table (+ pagination when needed). Reference `/leads`.
- Hierarchy: list → detail → edit, with back labels such as “Back to forms” / “Back to form”.
- Prefer extending leads UI primitives (search toggle, filters sheet, table chrome) over inventing new shells.

---

# API Rules

Always follow docs/24-api-standards.md.

Never expose Prisma models directly.

Always return DTOs.

Use the standard API response envelope.

---

# Database Rules

Always follow docs/25-database-schema.md.

Repositories contain only persistence logic.

Business rules belong in Services.

---

# Testing

Every business change should include appropriate tests.

Bug fixes should include regression tests.

---

# Security

Always

- validate input
- authenticate users
- authorize actions

Never trust client input.

---

# Role-scoped data access

Permission checks (`Permissions.*`) gate *actions*. Role scope gates *which rows* a user may see or mutate. Both are required on every list, detail, and mutation path — UI hiding alone is not enough.

## Leads (docs/13-leads.md)

| Role | Visible / mutable leads |
|---|---|
| Owner, Admin | All organization leads |
| Manager | `assignedMemberId === me` **or** `assignedManagerId === me` |
| Member | `assignedMemberId === me` only |

Additional lead rules:

- Full form edit / assign requires `LEAD_ASSIGN` (`canEditFull`).
- Members with `LEAD_UPDATE` may only change `statusId` and `description` on leads they can see.
- Create without `LEAD_ASSIGN` auto-assigns the creator as `assignedMember`.
- After changing default role permission sets in code, run `npm run roles:sync` (or open Members/Invite so `syncSystemRolePermissions` runs) to repair existing orgs.

Helpers live in `src/modules/leads/services/lead-access.ts`. Apply the same pattern when adding other scoped domains (dashboard, forms, etc.).

---

# When Unsure

Do not guess.

Read the relevant project documentation first.

If documentation is missing, ask before introducing a new pattern.


# Implementation Workflow

For every feature, follow this sequence:

1. Read the relevant documentation.
2. Understand existing architecture.
3. Identify reusable components.
4. Create a short implementation plan.
5. Wait for approval if the task is ambiguous.
6. Implement incrementally.
7. Verify TypeScript types.
8. Run linting.
9. Run tests when applicable.
10. Review the implementation against project conventions before finishing.

---

# Plan Index Re-check Status

Canonical live status lives in `PROJECT_TRACKER.md`. Update that file after meaningful work.

This section records which Plan Index items have been **re-checked** against their prompts/docs (not only marked done at first handoff). Last re-check sweep: **2026-07-26**.

| # | Plan | Tracker | Re-checked? | Outcome / remaining points |
|---|---|---|---|---|
| 01 | Core Foundation | `[x]` | Yes | Env via `env.ts`, domain `OrganizationContext` + `roleName`, role/member repos, Better Auth as sole provisioner, AppShell/onboarding load-only, unverified → `/verify`. Plan 01 lead-related deferrals closed under Plan 06. |
| 02 | UI-First Pages / Auth UI | `[x]` | Yes | Landing FAQ honesty, `/forgot-password` + `/reset-password`, typed verify resend, dashboard sample-data honesty. Carve-outs: invite/org edit → 05 (done); assignment → 06 (done); live dashboard → 07; forms → 09; notifications → 12. Terms/privacy pages added for OAuth. |
| 03 | App Shell & Navigation | `[x]` | Yes | Single sticky shell (mock chrome stripped), account foot popper (not Settings gear), Members → `/settings/members`, unfinished Forms/Branding/Notifications hidden, session-aware marketing CTAs, auth chrome, honest search copy, nav tests. |
| 04 | Marketing Landing Page | `[x]` | Yes | Product-complete copy (no static-data/roadmap hedging); `/Hero.png` hero + product preview; FAQ accordion from docs themes; final CTA; session-aware CTAs; plan file created. |
| 05 | Members, Roles & Settings | `[x]` | Yes | Invite/resend/revoke + `/invite/[token]` accept; default Admin/Manager/Member roles; role change/remove guards; org name update; Members in account-foot popper (not top-level nav). |
| 06 | Leads Management | `[x]` | Yes | Domain in `src/modules/leads/`; `Permissions.LEAD_*` + role-scoped visibility (Member/Manager/Owner-Admin); assign pools; status/notes allowlist for Members; filters/pagination/soft-delete/duplicates. Deferred: activity/notes/attachments/merge/Atlas/bulk/REST. |
| 07 | Dashboard v1 | `[~]` | Yes (deferred) | Intentionally deferred until Activity/Notifications; `/dashboard` remains sample data. |
| 08 | Custom Fields | `[x]` | Yes | Org definitions (`customfield.*`), settings UI, lead create/edit/detail values; MVP types TEXT–NUMBER. Sidebar nav before Forms; full-width list layout. |
| 09 | Lead Forms & Public Submissions | `[x]` | Yes | Admin forms + publish; public `/forms/[orgSlug]/[formSlug]`; atomic lead+submission+custom values+activity; Turnstile when configured. UX: list filters, `/forms/view/[id]`, draft/publish actions, email required core. |
| 10 | Search | `[~]` | Yes (skipped) | Intentionally skipped: no global/header search in MVP; list filters cover leads/forms. Revisit later if Atlas/global search is needed. |
| 11 | Activity Timeline | `[x]` | Yes | Lead-only append-only timeline on `/leads/[id]`; side-effects after create/update/assign/delete; form submit keeps atomic `lead.created_from_form`. |
| 12 | Notifications | `[x]` | Yes | In-app assign + status notifications; header bell with polling badge → `/notifications` center; no sockets/email. |
| 13 | Storage & Attachments | `[~]` | Yes (deferred) | Full lead attachments skipped; minimal S3/CloudFront presign slice lives under Plan 14 for org logos + user avatars only. Revisit for multipart/lead files. |
| 14 | Branding & Organization Settings | `[x]` | Yes | Org logo settings/header/public forms; per-form `brandingDisplay`; user profile avatar/phone/gender/password/Google link-unlink; no color picker UI. |
| 15–16, 99 | Later MVP / roadmap | `[ ]` | No | Not started; next is Testing & Quality Hardening (15). |

## Agent rules for this table

- Before starting work, read `PROJECT_TRACKER.md` **and** this re-check table.
- Do **not** mark a plan `[x]` in the tracker unless validation matches runtime behavior (tracker global rule).
- Prefer closing open points on `[~]` plans over starting later ones.
- When a re-check or close-out finishes, update **both** `PROJECT_TRACKER.md` (progress log + status) **and** this table.
