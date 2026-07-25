# docs/21-rbac-implementation.md

# RBAC & Authorization Implementation Guide

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines the implementation architecture for Role-Based Access Control (RBAC).

The objective is to make authorization

- Consistent
- Database-driven
- Type-safe
- Testable
- Extensible

Authorization should be enforced entirely on the server.

The frontend is responsible only for improving the user experience.

---

# Authorization Philosophy

Authentication answers

> Who are you?

Authorization answers

> What are you allowed to do?

These concerns must remain separate.

---

# Architecture

```
HTTP Request

↓

Authentication

↓

Organization Resolution

↓

Role Resolution

↓

Permission Resolution

↓

Business Logic

↓

Response
```

Authorization always happens before business logic.

---

# Permission-Based Authorization

Never check roles directly.

Avoid

```ts
if (user.role === "admin") {
    ...
}
```

Prefer

```ts
await authorization.can("lead.update")
```

Permissions become the source of truth.

---

# Database Structure

```
Organization

↓

OrganizationMember

↓

Role

↓

RolePermission

↓

Permission
```

Users receive permissions through membership.

---

# Permission Naming

Convention

```
resource.action
```

Examples

```
lead.read

lead.create

lead.update

lead.delete

lead.assign

member.invite

member.update

member.remove

form.publish

form.archive

organization.update
```

Avoid vague names like

```
manageLead

adminLead
```

---

# Permission Registry

Create a central permission registry.

Example

```ts
export const Permissions = {
    LEAD_READ: "lead.read",
    LEAD_CREATE: "lead.create",
    LEAD_UPDATE: "lead.update",
    LEAD_DELETE: "lead.delete",
}
```

Never scatter string literals throughout the application.

---

# Authorization Service

Expose a dedicated service.

Example

```ts
authorization.can()

authorization.canAll()

authorization.canAny()
```

Business services depend only on this interface.

---

# Example Interface

```ts
interface AuthorizationService {
    can(permission: string): Promise<boolean>

    canAll(permissions: string[]): Promise<boolean>

    canAny(permissions: string[]): Promise<boolean>
}
```

---

# Permission Resolution

Request

↓

Session

↓

User

↓

Organization Member

↓

Role

↓

Permissions

↓

Authorization Result

Permission resolution should happen once per request.

---

# Request Context

Resolved authorization data should be attached to the request context.

Example

```ts
request.user

request.organization

request.permissions
```

Avoid repeatedly querying permissions.

---

# Middleware

Recommended order

```
Authentication

↓

Organization

↓

Authorization

↓

Validation

↓

Business Logic
```

Each middleware has a single responsibility.

---

# Route Protection

Example

```ts
GET /leads

↓

Require

lead.read
```

Routes declare permissions explicitly.

---

# Server Actions

Server Actions should also perform authorization.

Never rely on hidden buttons.

Example

```ts
createLead()

↓

authorization.can("lead.create")

↓

Business Logic
```

---

# React Components

UI checks improve usability.

Example

```tsx
<Can permission="lead.create">
    <CreateLeadButton />
</Can>
```

These checks never replace server authorization.

---

# Permission Hook

Recommended hook

```ts
const canCreate = usePermission("lead.create")
```

Avoid fetching permissions inside individual components.

---

# Permission Provider

Provide permissions once.

```
App

↓

Permission Provider

↓

Hooks

↓

Components
```

Minimize duplicate requests.

---

# Route Guards

Protected routes

```
Dashboard

Settings

Members

Roles

Forms
```

Public routes

```
Landing

Login

Register

Public Forms
```

---

# Ownership Checks

Permissions alone are insufficient.

Example

```
lead.update

+

Assigned Member
```

Some actions require resource ownership.

---

# Resource Authorization

Example

```
Can Update Lead?

↓

Permission?

↓

Own Lead?

↓

Allowed
```

Business services evaluate both permission and resource access.

---

# Super Admin

Version 1

Not supported.

Every action occurs within an organization.

---

# Owner Rules

Exactly one owner exists per organization.

Owner

- Cannot be removed
- Cannot leave without transferring ownership
- Always has every permission

Implementation should avoid special cases where possible.

---

# Permission Caching

Permissions may be cached for the duration of a request.

Future

Redis

Memory Cache

---

# Database Queries

Avoid

```
Permission Query

↓

Every Endpoint
```

Prefer

```
Resolve Once

↓

Reuse
```

---

# API Errors

Unauthorized

```
401
```

Authenticated but insufficient permission

```
403
```

Never expose internal authorization details.

---

# Logging

Log

Permission Denied

Organization

User

Permission

Timestamp

Do not log sensitive request payloads.

---

# Testing Strategy

Unit Tests

Authorization Service

Permission Resolution

Role Mapping

Integration Tests

Protected Routes

Ownership Rules

End-to-End

Complete authorization workflows.

---

# Permission Groups

Groups exist only for administration UI.

Example

```
Lead Management

↓

lead.read

lead.create

lead.update

lead.delete
```

Groups are not used for authorization.

---

# Future Features

Architecture supports

Temporary Permissions

Delegated Access

Permission Expiration

Custom Roles

Permission Templates

Attribute-Based Access Control (ABAC)

without redesigning the authorization service.

---

# Security Principles

Never trust

Hidden buttons

Disabled controls

Client-side checks

JWT claims alone

Every sensitive action is authorized on the server.

---

# Design Principles

Permissions describe capabilities.

Roles collect permissions.

Users inherit permissions through organization membership.

Business services ask the Authorization Service instead of checking roles directly.

This keeps authorization centralized, testable, and easy to evolve.

---

# Success Criteria

The authorization system should

Be easy to understand

Require minimal duplicate code

Scale to new permissions

Support custom roles

Remain secure

without requiring business modules to understand RBAC implementation details.

---

End of RBAC Implementation Guide
