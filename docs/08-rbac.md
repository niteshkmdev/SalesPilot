# docs/08-rbac.md

# Role-Based Access Control (RBAC)

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines how authorization works throughout SalesPilot.

Authentication identifies the user.

RBAC determines what the user is allowed to do.

Authorization must always be enforced on the server.

The frontend exists only to improve user experience.

It is never a security boundary.

---

# Authorization Philosophy

Every protected operation answers one question:

> "Does this organization member have permission to perform this action?"

Authorization is determined from:

- Organization Membership
- Role
- Permissions
- Ownership Rules
- Resource Context

Never from the client.

---

# Terminology

User

Global identity.

Organization Member

A user's membership within a specific organization.

Role

A collection of permissions.

Permission

A single action that can be performed.

Permission Group

A UI-only grouping of related permissions.

Permission groups are **not stored in the database**.

---

# Authorization Flow

Every request follows the same process.

```
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

Ownership Rules

↓

Allow / Deny
```

---

# Permission Model

Permissions are stored as flat strings.

Examples

```
lead.read

lead.create

lead.update

lead.delete

lead.assign

member.read

member.invite

member.remove

form.read

form.create

branding.update
```

Flat permissions are easier to query, cache and extend.

---

# Permission Groups

Permission groups exist only for the UI.

Example

```
Lead

    lead.read
    lead.create
    lead.update
    lead.delete
    lead.assign

Members

    member.read
    member.invite
    member.remove

Forms

    form.read
    form.create
    form.update

Dashboard

    dashboard.view

Branding

    branding.read
    branding.update
```

These groups simplify the Role Management screen.

---

# Default Roles

SalesPilot provides four system roles.

```
Owner

Admin

Manager

Member
```

Organizations may eventually create custom roles.

---

# Owner

Exactly one Owner exists per organization.

Owner is represented by

```
OrganizationMember.isOwner = true
```

Owner is **not** a permission.

It is a special system capability.

---

# Owner Capabilities

Owner can

✓ Transfer ownership

✓ Delete organization

✓ Manage billing (future)

✓ Manage every member

✓ Manage every role

✓ Manage branding

✓ Manage lead forms

✓ Manage leads

✓ Invite users

✓ Remove admins

✓ Create custom roles

---

# Owner Restrictions

Owner

cannot delete themselves.

cannot remove ownership without transferring it.

There must always be one owner.

---

# Admin

Admin manages the organization.

Admin has nearly every permission except owner-only actions.

---

# Admin Capabilities

Can

Manage members

Invite users

Remove managers

Remove members

Manage forms

Manage branding

Manage leads

Manage notifications

Manage settings

Manage custom fields

---

# Admin Restrictions

Cannot

Remove Owner

Transfer Ownership

Delete Organization

Access future billing

---

# Manager

Manager supervises assigned members.

Manager permissions are intentionally narrower than Admin.

---

# Manager Capabilities

View dashboard

Manage assigned members

Manage assigned leads

Assign leads to members

Update lead status

Create notes

Upload attachments

Create forms (optional)

---

# Manager Restrictions

Cannot

Invite admins

Remove admins

Manage branding

Manage organization settings

Delete organization

Transfer ownership

---

# Member

Standard sales representative.

---

# Member Capabilities

View own dashboard

View assigned leads

Update assigned leads

Add notes

Upload attachments

Search own leads

---

# Member Restrictions

Cannot

Invite members

Delete leads

Manage branding

Manage settings

Manage permissions

Manage forms

---

# Custom Roles

Future versions allow organizations to create custom roles.

Custom roles are simply

```
Role

↓

Many Permissions
```

No code changes required.

---

# Permission Evaluation

Authorization occurs in three stages.

Stage 1

Authentication

↓

Valid Session

Stage 2

Permission

↓

Role contains permission

Stage 3

Ownership

↓

Resource context

Example

```
lead.update

↓

Can this member update THIS lead?
```

Permission alone may not be sufficient.

---

# Resource Ownership

Certain resources require ownership checks.

Examples

Assigned Lead

Organization Branding

Invitation

Notification

Profile

Example

```
Member

↓

lead.update

↓

Only assigned leads
```

---

# Manager Hierarchy

Managers supervise Members.

```
Admin

↓

Manager

↓

Member
```

Managers never supervise Admins.

Managers never supervise Owners.

---

# Organization Hierarchy

```
Owner

↓

Admin

↓

Manager

↓

Member
```

Hierarchy is enforced by application logic.

---

# Permission Matrix

| Permission | Owner | Admin | Manager | Member |
|------------|:-----:|:-----:|:-------:|:------:|
| Dashboard View | ✓ | ✓ | ✓ | ✓ |
| Lead Read | ✓ | ✓ | ✓ | ✓ |
| Lead Create | ✓ | ✓ | ✓ | ✓ |
| Lead Update | ✓ | ✓ | Context | Context |
| Lead Delete | ✓ | ✓ | ✗ | ✗ |
| Lead Assign | ✓ | ✓ | ✓ | ✗ |
| Invite Members | ✓ | ✓ | ✗ | ✗ |
| Remove Members | ✓ | ✓ | Context | ✗ |
| Branding Update | ✓ | ✓ | ✗ | ✗ |
| Settings Update | ✓ | ✓ | ✗ | ✗ |
| Role Management | ✓ | ✓ | ✗ | ✗ |
| Organization Delete | ✓ | ✗ | ✗ | ✗ |

Context means resource ownership rules apply.

---

# Server Enforcement

Every mutation validates permissions.

Example

```
Update Lead

↓

Validate Session

↓

Find Organization Member

↓

Check Permission

↓

Check Ownership

↓

Execute Action
```

Failure immediately returns

```
403 Forbidden
```

---

# Frontend Authorization

Frontend may hide

Buttons

Menus

Pages

Bulk Actions

This improves UX.

It does **not** provide security.

Every API repeats the same permission checks.

---

# Permission Helpers

Every feature exposes permission helpers.

Example

```
canReadLead()

canAssignLead()

canDeleteLead()

canInviteMember()

canManageBranding()
```

Components should never compare permission strings directly.

---

# Permission Cache

Permissions are resolved per request.

Do not cache permissions inside the session.

Benefits

✓ Immediate role changes

✓ Immediate permission updates

✓ No stale authorization

---

# Role Changes

Changing a user's role

takes effect immediately.

No logout required.

No session refresh required.

---

# Organization Isolation

Permissions are scoped to an organization.

Example

```
User

↓

Organization A

↓

Admin

AND

Organization B

↓

Member
```

Permissions never cross organizations.

---

# API Authorization

Every protected endpoint performs

Authentication

↓

Membership Lookup

↓

Permission Check

↓

Ownership Check

↓

Business Validation

↓

Database Mutation

Permission validation always happens before business logic.

---

# Navigation Visibility

Navigation adapts to permissions.

Example

Member

```
Dashboard

Leads

Notifications

Profile
```

Admin

```
Dashboard

Leads

Forms

Members

Settings

Branding

Notifications

```

---

# Activity Integration

Permission-sensitive actions generate activities.

Examples

Role Changed

Invitation Sent

Invitation Accepted

Lead Assigned

Ownership Transferred

Organization Updated

Activities remain immutable.

---

# Error Responses

Permission denied

```
403 Forbidden
```

Example response

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

Never reveal internal authorization rules.

---

# Security Principles

Never trust

Hidden buttons

Client roles

Client permissions

Request payloads

Always resolve authorization from the database.

---

# Future Expansion

The RBAC architecture supports

✓ Custom Roles

✓ Resource Policies

✓ Team-Based Permissions

✓ Field-Level Permissions

✓ Temporary Permissions

✓ Delegated Administration

without redesigning the permission model.

---

# RBAC Goals

The authorization system should be

✓ Predictable

✓ Database Driven

✓ Organization Scoped

✓ Easy to Extend

✓ Secure

✓ Simple to Understand

Authorization should remain explicit, centralized, and enforceable across every feature.

---

End of RBAC Document
