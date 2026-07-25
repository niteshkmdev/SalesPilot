# docs/02-architecture.md

# Software Architecture

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines the overall architecture of SalesPilot.

It explains how every layer of the application communicates, where business logic belongs, how modules are organized, and the architectural rules that every contributor (human or AI) must follow.

This document is considered mandatory reading before implementing any feature.

---

# High Level Architecture

SalesPilot follows a modern Vertical Slice Architecture built on top of the Next.js App Router.

Each business module owns its:

- UI
- Validation
- Business Logic
- Repository
- Permissions
- Hooks
- Types

Shared infrastructure is isolated from business logic.

```
┌───────────────────────────────────────┐
│              Browser                  │
└───────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│         Next.js App Router            │
│         Server Components             │
│         Client Components             │
└───────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│         Route Handlers (/api/v1)      │
└───────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│       Feature Actions / Services      │
└───────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│          Repository Layer             │
└───────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│ Prisma ORM + MongoDB                  │
└───────────────────────────────────────┘
```

---

# Architectural Principles

SalesPilot follows five primary principles.

## 1. Feature Ownership

Every feature owns itself.

Authentication owns authentication.

Leads own leads.

Forms own forms.

Notifications own notifications.

Business logic should never leak into unrelated modules.

---

## 2. Thin Controllers

API route handlers should never contain business logic.

Good

```ts
export async function POST(request: Request) {
    return createLeadRoute(request);
}
```

Bad

```ts
export async function POST(request: Request) {
    // 250 lines
}
```

Route handlers should ideally remain below 30 lines.

---

## 3. Business Logic Lives In Actions

Actions coordinate business operations.

Example

```
Create Lead

↓

Validate Input

↓

Permission Check

↓

Repository

↓

Activity

↓

Notification

↓

Return Response
```

Actions orchestrate.

Repositories persist.

Components render.

---

## 4. Repository Pattern

Repositories are responsible only for persistence.

Responsibilities

✓ Read

✓ Create

✓ Update

✓ Delete

✓ Query

Repositories should never

- validate input
- check permissions
- send notifications
- create activities
- contain business rules

---

## 5. Server Is Source Of Truth

Every mutation must execute on the server.

Never trust

- hidden buttons
- disabled UI
- client state

Permissions are always verified server-side.

---

# Module Architecture

Each module owns everything required for that domain.

Example

```
modules/

    leads/

        actions/

        components/

        hooks/

        permissions/

        repository/

        validation/

        types/

        constants/

        utils/
```

This pattern is repeated for every business feature.

---

# Shared Code

Only reusable code belongs inside shared.

```
shared/

    components/

    hooks/

    lib/

    constants/

    utils/

    validation/

    types/
```

Shared should never contain business logic.

If something is specific to Leads, it belongs inside Leads.

---

# Infrastructure Layer

Infrastructure is isolated.

```
server/

    auth/

    db/

    email/

    search/

    storage/

    logger/

    permissions/
```

Infrastructure contains integrations.

Business rules belong inside modules.

---

# Request Lifecycle

Every request follows the same path.

```
Browser

↓

Route Handler

↓

Action

↓

Validation

↓

Permission Check

↓

Repository

↓

Activity

↓

Notification

↓

Typed Response
```

This flow should remain identical across the application.

---

# UI Architecture

The UI is divided into three categories.

## Marketing

Public website.

No authentication required.

Server Components preferred.

---

## Public Forms

Accessible without login.

Minimal JavaScript.

Optimized for speed.

---

## CRM

Authenticated dashboard.

Combination of:

Server Components

Client Components

TanStack Query

React Hook Form

---

# Rendering Strategy

Prefer Server Components.

Client Components only when required.

Use Client Components for:

- Forms
- Charts
- Interactive tables
- Dialogs
- Editors
- Notifications

Everything else should remain Server Components.

---

# API Architecture

REST only.

Every endpoint lives under

```
/api/v1/
```

Example

```
/api/v1/auth

/api/v1/leads

/api/v1/forms

/api/v1/users

/api/v1/settings

/api/v1/notifications
```

Every endpoint returns typed JSON.

---

# Authentication Architecture

Better Auth manages

- Sessions
- OAuth
- Email Password
- Verification

SalesPilot manages

- Organizations
- Membership
- Roles
- Permissions
- Invitations

Authentication and authorization remain separate concerns.

---

# Authorization Architecture

Authorization is Role Based.

User

↓

Organization Member

↓

Role

↓

Permissions

Permissions are loaded from the database.

Never hardcode permissions.

---

# Organization Model

Current implementation supports one organization.

Architecture supports many.

Relationship

```
User

↓

OrganizationMember

↓

Organization
```

Users never directly belong to organizations.

---

# Event Driven Side Effects

Business operations may generate secondary events.

Example

```
Lead Created

↓

Activity Created

↓

Notification Created
```

The primary operation must succeed before secondary events execute.

Future implementations may replace this with queues.

---

# Validation Strategy

Every request validates using Zod.

Validation occurs

before

permission checks.

Never trust request bodies.

Validation schemas live beside the feature.

```
modules/

    leads/

        validation/
```

---

# Search Architecture

Primary

MongoDB Atlas Search

Fallback

Regex

Search is abstracted behind a Search Service.

No module directly performs Atlas queries.

---

# File Storage

Attachments use S3 compatible storage.

Storage provider is configurable.

No business module should know which provider is used.

Only the Storage Service interacts with S3.

---

# Activity Architecture

Every important mutation creates Activity.

Activities are immutable.

Activities are append-only.

Activities cannot be edited.

Activities cannot be deleted.

---

# Notification Architecture

Notifications are created automatically.

Examples

Lead Assigned

Lead Updated

Member Invited

Lead Merged

Notifications are in-app only.

---

# Error Handling

Errors should be categorized.

Validation

Authentication

Authorization

Business Rule

Infrastructure

Unknown

Never expose stack traces.

Return standardized responses.

---

# Standard API Response

Success

```json
{
    "success": true,
    "data": {}
}
```

Failure

```json
{
    "success": false,
    "error": {
        "code": "LEAD_NOT_FOUND",
        "message": "Lead not found."
    }
}
```

This format must remain consistent.

---

# Soft Delete Strategy

Business entities use soft deletes.

```
deletedAt

deletedBy
```

Queries should automatically exclude deleted records.

Restore functionality may be added later.

---

# Naming Conventions

Actions

```
createLead.ts

assignLead.ts

mergeLead.ts
```

Repositories

```
lead.repository.ts
```

Validation

```
createLead.schema.ts
```

Hooks

```
useLeadFilters.ts
```

Components

```
LeadTable.tsx
```

Maintain consistency across every module.

---

# Dependency Rules

Allowed

```
Component

↓

Action

↓

Repository

↓

Database
```

Forbidden

```
Component

↓

Prisma
```

Forbidden

```
Route

↓

Prisma
```

Forbidden

```
Repository

↓

Notification
```

Forbidden

```
Repository

↓

Permission
```

Repositories must remain persistence-only.

---

# Scalability

The architecture should support future additions without major rewrites.

Future features

- Multiple Organizations
- Ownership Transfer
- Email Notifications
- Billing
- Webhooks
- API Keys
- Workflow Automation
- AI Lead Scoring

These are intentionally excluded today but should fit naturally into the architecture.

---

# Architectural Goals

The codebase should optimize for:

✓ Readability

✓ Maintainability

✓ Predictability

✓ Testability

✓ Scalability

✓ Type Safety

✓ Low Cognitive Load

Every new feature should fit naturally into this architecture without introducing special cases or inconsistent patterns.

---

End of Architecture Document
