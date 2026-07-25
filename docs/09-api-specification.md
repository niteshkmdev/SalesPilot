# docs/09-api-specification.md

# REST API Specification

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines the REST API architecture for SalesPilot.

The API is designed to be:

- Consistent
- Predictable
- Versioned
- Type-safe
- Easy to consume

Every endpoint should follow the same conventions.

---

# API Philosophy

The API is the contract between the frontend and backend.

Every endpoint should behave consistently.

Developers should never need to guess

- request structure
- response structure
- error format
- authentication behavior

---

# API Style

Architecture

```
REST
```

Versioning

```
/api/v1
```

Content Type

```
application/json
```

Encoding

```
UTF-8
```

---

# Base URL

Development

```
http://localhost:3000/api/v1
```

Production

```
https://salespilot.com/api/v1
```

---

# Route Structure

Resources use plural nouns.

Good

```
GET /leads

POST /leads

GET /members

PATCH /organizations
```

Avoid

```
/getLeads

/createLead

/deleteLead
```

HTTP methods communicate intent.

---

# HTTP Methods

GET

Retrieve data.

POST

Create resources.

PATCH

Partial update.

PUT

Reserved for full replacement.

DELETE

Soft delete.

---

# API Versioning

Every endpoint includes a version.

```
/api/v1/
```

Future versions

```
/api/v2/
```

Breaking changes require a new version.

---

# Authentication

Protected endpoints require authentication.

Authentication uses Better Auth session cookies.

Clients never send user IDs.

Identity comes from the session.

---

# Authorization

Every protected endpoint performs

Authentication

↓

Membership Resolution

↓

Permission Validation

↓

Ownership Validation

↓

Business Logic

Authorization failures return

```
403 Forbidden
```

---

# Request Headers

Required

```
Content-Type: application/json
```

Optional

```
Accept: application/json
```

Authentication cookies handled automatically.

---

# Standard Success Response

Every successful response follows the same shape.

```json
{
  "success": true,
  "data": {}
}
```

Collections

```json
{
  "success": true,
  "data": []
}
```

---

# Standard Error Response

Every failure returns

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Never return inconsistent error shapes.

---

# Validation Error

Status

```
400 Bad Request
```

Example

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": {
      "email": [
        "Invalid email address."
      ]
    }
  }
}
```

---

# Unauthorized

Status

```
401 Unauthorized
```

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required."
  }
}
```

---

# Forbidden

Status

```
403 Forbidden
```

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

---

# Not Found

Status

```
404 Not Found
```

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Requested resource was not found."
  }
}
```

---

# Conflict

Status

```
409 Conflict
```

Examples

Duplicate invitation

Duplicate slug

Duplicate email

---

# Server Error

Status

```
500 Internal Server Error
```

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Something went wrong."
  }
}
```

Never expose stack traces.

---

# Pagination

Collections support pagination.

Query Parameters

```
?page=1

?limit=25
```

Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 250,
    "totalPages": 10
  }
}
```

---

# Sorting

Query

```
?sort=createdAt

?order=desc
```

Supported

```
asc

desc
```

---

# Filtering

Examples

```
?status=qualified

?assignedMember=id

?source=website
```

Multiple filters

```
?status=qualified&source=website
```

---

# Search

```
?q=acme
```

Uses

Atlas Search

↓

Regex fallback

---

# Field Selection

Future

```
?fields=id,name,email
```

Out of scope for v1.

---

# Include Related Resources

Future

```
?include=activities
```

Out of scope.

---

# Lead Endpoints

## List Leads

```
GET /leads
```

Supports

Pagination

Sorting

Filtering

Search

---

## Get Lead

```
GET /leads/{id}
```

---

## Create Lead

```
POST /leads
```

Body

```json
{
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": ""
}
```

Returns

Created Lead.

---

## Update Lead

```
PATCH /leads/{id}
```

Updates only supplied fields.

---

## Delete Lead

```
DELETE /leads/{id}
```

Soft delete only.

---

## Assign Lead

```
PATCH /leads/{id}/assign
```

Body

```json
{
  "assignedMemberId": ""
}
```

---

## Merge Leads

```
POST /leads/merge
```

Body

```json
{
  "sourceLeadIds": [
    "...",
    "..."
  ],
  "mergedLead": {}
}
```

Creates

New Lead

↓

Soft deletes originals.

---

# Member Endpoints

List

```
GET /members
```

Invite

```
POST /members/invite
```

Update Role

```
PATCH /members/{id}
```

Remove

```
DELETE /members/{id}
```

---

# Organization Endpoints

Current Organization

```
GET /organization
```

Update

```
PATCH /organization
```

---

# Branding

Retrieve

```
GET /branding
```

Update

```
PATCH /branding
```

---

# Role Endpoints

```
GET /roles

GET /permissions

PATCH /roles/{id}
```

Future

Create Custom Role

Delete Custom Role

---

# Notification Endpoints

List

```
GET /notifications
```

Mark Read

```
PATCH /notifications/{id}
```

Mark All Read

```
PATCH /notifications/read-all
```

---

# Dashboard Endpoints

```
GET /dashboard
```

Returns

Metrics

Charts

Recent Activity

Notifications

---

# Form Endpoints

List

```
GET /lead-forms
```

Create

```
POST /lead-forms
```

Update

```
PATCH /lead-forms/{id}
```

Archive

```
PATCH /lead-forms/{id}/archive
```

Public Submission

```
POST /forms/{slug}/submit
```

No authentication required.

Protected by Turnstile.

---

# Upload Endpoints

Generate Upload URL

```
POST /uploads
```

Returns

Signed Upload URL.

Application uploads directly to S3.

The API never proxies file uploads.

---

# Activity Endpoints

```
GET /activities
```

Supports

Lead

Member

Organization filters.

Read only.

---

# Rate Limiting

Apply to

Authentication

Invitations

Public Forms

Uploads

Password Reset

Future

Public API

---

# Idempotency

DELETE

Idempotent

PATCH

Should be idempotent.

POST

Generally not idempotent.

---

# Validation

Every endpoint validates

Input

↓

Business Rules

↓

Permissions

↓

Database

Validation occurs before persistence.

---

# Route Handler Structure

Example

```ts
export async function POST(request: Request) {
    return createLeadRoute(request);
}
```

Route handlers should never contain business logic.

---

# API Layer

```
Route

↓

Validation

↓

Action

↓

Repository

↓

Prisma
```

Business rules belong in Actions.

Repositories perform persistence only.

---

# Naming Conventions

Resources

Plural

```
leads

members

notifications
```

Actions

Nested

```
assign

archive

merge

read-all
```

Avoid verbs in root URLs.

---

# HTTP Status Codes

200

Success

201

Created

204

No Content

400

Validation Error

401

Unauthenticated

403

Forbidden

404

Not Found

409

Conflict

422

Business Rule Failure (optional)

429

Rate Limited

500

Server Error

---

# API Principles

Every endpoint should be

Predictable

Consistent

Well Typed

Permission Protected

Organization Scoped

Versioned

RESTful

---

# Future API Features

The architecture supports

Public API Keys

Webhooks

GraphQL

Bulk Endpoints

Cursor Pagination

API Tokens

without redesigning existing routes.

---

# Final Goal

The API should feel like a production SaaS API.

Frontend developers should be able to understand any endpoint after learning only one.

Consistency is more valuable than cleverness.

---

End of API Specification
