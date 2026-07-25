# docs/25-database-schema.md

# Database Schema & Prisma Design

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines the final database architecture for SalesPilot.

The schema should be

- Simple
- Consistent
- Extensible
- Multi-tenant
- Production-ready

The database model is the foundation of the application and should require minimal changes as new features are added.

---

# Design Principles

The schema should follow these principles.

✓ Normalize business entities

✓ Avoid duplicate data

✓ Support soft deletes

✓ Support future expansion

✓ Keep relationships explicit

✓ Never store derived data unnecessarily

---

# Database Technology

ORM

```
Prisma
```

Database

```
MongoDB
```

Version

```
Prisma MongoDB Provider
```

---

# Collection Overview

```
User

Session

Account

Verification

Organization

OrganizationMember

Role

Permission

RolePermission

Invitation

Lead

LeadStatus

LeadSource

LeadAttachment

LeadNote

LeadForm

FormSubmission

CustomField

LeadCustomFieldValue

Activity

Notification

Branding
```

---

# User

Global entity.

Represents identity.

```text
id

name

email

emailVerified

image

createdAt

updatedAt
```

Relationships

```
OrganizationMember

Account

Session
```

---

# Organization

Tenant root.

```text
id

name

slug

createdAt

updatedAt
```

Relationships

```
Members

Roles

Leads

Forms

Branding

Statuses

Sources

Activities

Notifications
```

---

# OrganizationMember

Join table.

```text
id

organizationId

userId

roleId

isOwner

joinedAt
```

Composite Index

```
organizationId

userId
```

---

# Role

Organization-specific.

```text
id

organizationId

name

description

createdAt
```

Relationships

```
RolePermission

Members
```

---

# Permission

Global table.

```text
id

name

description

group
```

Examples

```
lead.read

lead.create

lead.update

member.invite
```

Permissions are seeded.

Never editable by users.

---

# RolePermission

Join table.

```text
roleId

permissionId
```

Composite Index

```
roleId

permissionId
```

---

# Invitation

```text
id

organizationId

email

roleId

token

expiresAt

acceptedAt

createdBy

createdAt
```

Tokens are single-use.

---

# Lead

Primary business entity.

```text
id

organizationId

statusId

sourceId

assignedManagerId

assignedMemberId

firstName

lastName

email

phone

company

jobTitle

website

description

isDuplicate

deletedAt

createdBy

updatedBy

createdAt

updatedAt
```

Indexes

```
organizationId

email

phone

statusId

assignedMemberId

createdAt
```

---

# OrganizationLeadStatus

Organization-defined pipeline.

```text
id

organizationId

name

color

displayOrder

isDefault

isClosed

isWon
```

Example

```
New

Qualified

Proposal Sent

Won

Lost
```

No hardcoded pipeline stages.

---

# OrganizationLeadSource

Organization-defined lead sources.

```text
id

organizationId

name

displayOrder

active
```

Examples

```
Website

Referral

Walk-In

Cold Call
```

---

# LeadAttachment

```text
id

organizationId

leadId

fileName

storageKey

contentType

size

uploadedBy

createdAt
```

Files remain in object storage.

Only metadata is stored.

---

# LeadNote

```text
id

organizationId

leadId

content

createdBy

updatedAt

createdAt
```

MDX content supported.

Future

Threaded comments.

---

# LeadForm

```text
id

organizationId

name

slug

description

status

createdBy

updatedBy

createdAt

updatedAt
```

Statuses

```
Draft

Published

Archived
```

---

# FormSubmission

Immutable.

```text
id

organizationId

leadFormId

leadId

payload

ipAddress

userAgent

submittedAt
```

Payload stores submitted values.

---

# CustomField

```text
id

organizationId

name

slug

type

required

placeholder

helpText

defaultValue

displayOrder

active
```

---

# LeadCustomFieldValue

```text
id

leadId

fieldId

value
```

Composite Index

```
leadId

fieldId
```

---

# Activity

Immutable audit log.

```text
id

organizationId

actorId

entityType

entityId

action

metadata

createdAt
```

Indexes

```
organizationId

entityId

createdAt
```

---

# Notification

```text
id

organizationId

memberId

type

title

message

metadata

readAt

createdAt
```

Unread Index

```
memberId

readAt
```

---

# Branding

```text
id

organizationId

logo

primaryColor

secondaryColor

accentColor

updatedAt
```

One branding record per organization.

---

# Better Auth Tables

Managed by Better Auth.

```
Account

Session

Verification
```

Do not modify manually.

---

# Relationships

```
Organization

├── Members

├── Roles

├── Leads

├── Lead Statuses

├── Lead Sources

├── Lead Forms

├── Activities

├── Branding

└── Notifications
```

---

# Soft Deletes

Supported

```
Lead
```

Future

Forms

Custom Fields

Members

Deleted records remain recoverable.

---

# Cascade Rules

Deleting an organization is out of scope.

Business entities should generally use

Soft Delete

rather than cascading physical deletion.

---

# Indexing Strategy

Primary indexes

```
organizationId

createdAt

updatedAt
```

Secondary indexes

```
email

phone

statusId

assignedMemberId

slug
```

Composite indexes

```
organizationId + slug

organizationId + email

organizationId + userId
```

---

# ID Strategy

Every collection uses

```
cuid2()
```

Advantages

- URL-safe
- Collision resistant
- Good developer experience

Avoid auto-increment IDs.

---

# Audit Fields

Every mutable entity contains

```text
createdAt

updatedAt
```

Business entities also include

```text
createdBy

updatedBy
```

where appropriate.

---

# Enums

Application enums only.

Examples

```
LeadFormStatus

NotificationType
```

Organization-configurable values (statuses, sources, roles) should **not** be enums.

---

# Transactions

Use Prisma transactions for

Lead Creation

Lead Merge

Invitation Acceptance

Role Updates

Organization Creation

Any workflow affecting multiple collections.

---

# Repository Pattern

Repositories

- Receive Prisma Client
- Contain CRUD operations
- Never contain authorization
- Never contain validation
- Never contain business logic

---

# Mappers

Database models should never leave the repository layer.

Flow

```
Prisma Model

↓

Mapper

↓

DTO

↓

API Response
```

---

# Seeding

Seed only global data

```
Permissions

System Roles (optional)

Development Data (development only)
```

Organization-specific records are created during onboarding.

---

# Migration Strategy

Prisma migrations manage schema evolution.

Rules

- Small, incremental migrations
- Backward-compatible where possible
- Never modify production data manually

---

# Performance

Goals

Indexed tenant queries

Minimal joins

Efficient pagination

Transaction safety

Support hundreds of thousands of leads per organization.

---

# Future Schema Expansion

The schema is designed to support

Tasks

Reminders

Tags

AI Insights

Workflow Automation

CRM Integrations

Calendars

Meetings

Email Sync

without requiring significant redesign.

---

# Design Principles

The schema should remain

Simple enough for new developers to understand.

Flexible enough for future growth.

Strict enough to preserve data integrity.

Business modules should depend on repositories and services rather than Prisma models directly.

---

# Success Criteria

The database design should

Scale with application growth

Support multi-tenancy

Minimize duplication

Remain easy to query

Require few breaking changes over time

while serving as a stable foundation for the rest of the application.

---

End of Database Schema & Prisma Design
