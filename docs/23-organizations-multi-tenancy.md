# docs/23-organizations-multi-tenancy.md

# Organizations & Multi-Tenancy Implementation Guide

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines how SalesPilot implements multi-tenancy.

Every organization is completely isolated from every other organization.

Users work inside an organization, not globally.

Multi-tenancy is a foundational architectural concern and must be enforced consistently throughout the application.

---

# Design Goals

The multi-tenancy architecture should be

✓ Secure

✓ Isolated

✓ Scalable

✓ Easy to Understand

✓ Easy to Extend

✓ Database Driven

---

# Core Philosophy

Everything belongs to an organization.

There are almost no global business resources.

Example

```
Organization

↓

Members

↓

Leads

↓

Forms

↓

Activities

↓

Notifications

↓

Branding
```

---

# Tenant Definition

A tenant represents

```
One Organization
```

Each organization owns

- Members
- Roles
- Permissions
- Leads
- Lead Forms
- Activities
- Notifications
- Branding
- Custom Fields

No business data is shared across organizations.

---

# Data Ownership

Every business entity contains

```
organizationId
```

Example

```
Lead

↓

organizationId

Form

↓

organizationId

Activity

↓

organizationId
```

This enables efficient filtering and authorization.

---

# Global Entities

Some entities are global.

Examples

```
User

Permission

Session
```

These are not organization-specific.

Everything else should belong to an organization.

---

# Relationship Model

```
User

↓

OrganizationMember

↓

Organization
```

Users never own organization data directly.

Organization membership is the source of access.

---

# Membership Model

Each membership contains

```
User ID

Organization ID

Role ID

Is Owner

Joined At
```

Future

Invitation Status

Last Active

---

# Organization Creation

Flow

```
Register

↓

Create User

↓

Create Organization

↓

Create Owner Role

↓

Create Membership

↓

Dashboard
```

The creator becomes the Owner.

---

# Organization Resolution

Every authenticated request resolves

```
Session

↓

User

↓

Organization Membership

↓

Organization Context
```

Business services receive the resolved organization context.

---

# Organization Context

Example

```ts
interface OrganizationContext {
    organizationId: string
    memberId: string
    roleId: string
}
```

Avoid repeatedly querying organization information.

---

# Request Lifecycle

```
HTTP Request

↓

Authentication

↓

Organization Resolution

↓

Authorization

↓

Business Logic

↓

Response
```

Organization resolution always happens before authorization.

---

# Data Isolation

Every query includes

```
organizationId
```

Example

```ts
WHERE organizationId = currentOrganization
```

Never query business data without tenant scoping.

---

# Repository Pattern

Repositories receive

```
organizationId
```

Example

```ts
leadRepository.findById(
    organizationId,
    leadId
)
```

Repositories never infer organization context.

---

# Service Layer

Services receive

```
Organization Context
```

instead of individual IDs whenever possible.

Example

```ts
leadService.create(context, input)
```

---

# Ownership Rules

Each organization has

Exactly One Owner

The owner

- Cannot be deleted
- Cannot leave
- Cannot lose ownership without transfer

Ownership transfer must be explicit.

---

# Organization Settings

Organization owns

General Settings

Branding

Members

Roles

Lead Statuses

Lead Sources

Custom Fields

Future

Billing

API Keys

Webhooks

---

# Branding

Branding belongs to

```
Organization
```

Includes

Logo

Primary Color

Secondary Color

Accent Color

Branding automatically applies to

Lead Forms

Emails (Future)

PDFs (Future)

---

# Organization Slug

Every organization has a unique slug.

Example

```
acme

techsphere

digitalheroes
```

Slug may be used for

Future public URLs

Organization switching

API integrations

---

# Organization Status

Version 1

```
Active
```

Future

```
Suspended

Archived

Pending Verification
```

---

# Multi-Organization Users

Version 1

Not supported.

Future

```
User

↓

Organization A

Organization B

Organization C
```

Users choose an active organization after login.

---

# Organization Switching

Future Flow

```
Dashboard

↓

Switch Organization

↓

Reload Context

↓

Continue
```

Sessions remain user-based.

Organization context changes.

---

# Database Queries

Always filter

```
organizationId
```

Avoid

```ts
findMany()
```

Prefer

```ts
findMany({
    where: {
        organizationId
    }
})
```

---

# Search Isolation

Search service always receives

```
organizationId
```

Search results never cross organization boundaries.

---

# Storage Isolation

Storage keys include

```
organizations/

{organizationId}/
```

Every uploaded file belongs to one organization.

---

# Activity Isolation

Activities are organization scoped.

Members cannot view activities from another organization.

---

# Notification Isolation

Notifications belong to

```
Organization Member
```

and are never shared between organizations.

---

# API Design

Organization context should come from

Authenticated session

not from client-provided IDs.

Avoid endpoints like

```
GET /organizations/{id}/leads
```

Prefer

```
GET /leads
```

The server already knows the active organization.

---

# Authorization

Authorization always evaluates

```
User

+

Organization

+

Permissions

+

Resource Ownership
```

All four are required for secure access.

---

# Caching

Cache keys should include

```
organizationId
```

Example

```
dashboard:org123

members:org123

pipeline:org123
```

Never share cached business data across tenants.

---

# Logging

Every log entry should include

```
Organization ID

Member ID

Request ID
```

Avoid logging sensitive business data.

---

# Backups

Future

Support

Organization-level export

Organization restore

Selective recovery

without affecting other tenants.

---

# API Examples

Good

```
GET /leads

GET /members

GET /activities
```

Bad

```
GET /organization/123/leads
```

The organization should be inferred from the authenticated context.

---

# Testing Strategy

Unit Tests

Organization Resolution

Membership Lookup

Ownership Rules

Integration Tests

Tenant Isolation

Repository Queries

Authorization

End-to-End

Complete organization lifecycle

Cross-tenant access prevention

---

# Security Principles

Never trust

Client-provided organization IDs

Hidden fields

Query parameters

Organization context always comes from the authenticated session.

---

# Performance

Goals

Indexed organization queries

Efficient joins

Minimal repeated membership lookups

Fast tenant resolution

Multi-tenancy should introduce minimal overhead.

---

# Future Features

Architecture supports

Multiple Organizations per User

Organization Switching

Billing

Subscriptions

Custom Domains

White Labeling

API Keys

Organization Templates

without redesigning the tenancy model.

---

# Design Principles

Organizations are the primary boundary of the system.

Every business resource belongs to an organization.

Business modules never determine tenant context themselves.

The server resolves the active organization once and passes it through the application.

This approach minimizes security risks while keeping business logic clean.

---

# Success Criteria

The multi-tenancy architecture should

Completely isolate organizations

Require minimal duplicate code

Scale to thousands of organizations

Remain easy to reason about

Support future multi-organization users

without requiring major architectural changes.

---

End of Organizations & Multi-Tenancy Implementation Guide
