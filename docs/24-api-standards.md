# docs/24-api-standards.md

# API Standards & Error Handling Guide

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines the standards used for every REST API endpoint in SalesPilot.

A consistent API makes the application easier to

- Develop
- Test
- Document
- Maintain
- Extend

Every endpoint should follow the same conventions regardless of the module.

---

# Design Goals

The API should be

✓ Predictable

✓ Consistent

✓ RESTful

✓ Versioned

✓ Type Safe

✓ Easy to Consume

---

# API Philosophy

The API exposes business capabilities.

It should never expose

- Database structure
- ORM models
- Internal implementation
- Infrastructure details

Clients communicate using DTOs only.

---

# API Versioning

All endpoints begin with

```
/api/v1
```

Example

```
/api/v1/leads

/api/v1/members

/api/v1/forms
```

Future

```
/api/v2
```

New versions should not break existing clients.

---

# URL Naming

Use

Plural nouns

Examples

```
GET /leads

POST /leads

PATCH /leads/{id}

DELETE /leads/{id}
```

Avoid

```
/getLeads

/createLead

/deleteLead
```

---

# HTTP Methods

```
GET

Retrieve

POST

Create

PATCH

Partial Update

PUT

Full Replacement (rare)

DELETE

Delete Resource
```

Avoid using POST for updates.

---

# Resource Design

Good

```
/leads

/leads/{id}

/members

/forms
```

Bad

```
/leadData

/updateLead

/deleteMember
```

Resources represent nouns.

Actions belong to HTTP methods.

---

# Nested Resources

Allowed only when relationships are explicit.

Example

```
GET /leads/{id}/attachments

GET /forms/{id}/submissions
```

Avoid deep nesting.

---

# Request Validation

Every request passes through

```
Request

↓

Zod Validation

↓

Business Logic
```

Never trust client input.

---

# Response Envelope

Every successful response

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

# Error Envelope

Every error

```json
{
    "success": false,
    "error": {
        "code": "LEAD_NOT_FOUND",
        "message": "Lead not found."
    }
}
```

Clients should depend on

```
code
```

not

```
message
```

---

# Error Codes

Convention

```
RESOURCE_ACTION
```

Examples

```
LEAD_NOT_FOUND

LEAD_ALREADY_EXISTS

FORM_NOT_FOUND

PERMISSION_DENIED

VALIDATION_FAILED

INVALID_TOKEN

SESSION_EXPIRED
```

Codes remain stable.

Messages may change.

---

# HTTP Status Codes

```
200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Unprocessable Entity

429 Too Many Requests

500 Internal Server Error
```

Use the most appropriate status code.

---

# Pagination

Query Parameters

```
?page=1

?limit=20
```

Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 243,
    "totalPages": 13
  }
}
```

---

# Sorting

Query Parameter

```
?sort=createdAt

?order=desc
```

Future

Multiple sorting fields.

---

# Filtering

Examples

```
?status=qualified

?assignedTo=123

?source=website
```

Filters should remain explicit.

---

# Search

Example

```
?q=rahul
```

Search implementation remains internal.

---

# Date Format

Always

ISO-8601

Example

```
2026-08-14T10:45:00Z
```

Never return localized date strings.

---

# Identifiers

Use

```
id
```

Example

```json
{
    "id": "clx123..."
}
```

Avoid exposing database-specific identifiers.

---

# DTO Pattern

```
Database Model

↓

Mapper

↓

DTO

↓

Response
```

Never serialize ORM models directly.

---

# Validation Errors

Example

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed.",
    "fields": {
      "email": [
        "Email is invalid."
      ]
    }
  }
}
```

Field-level errors improve UX.

---

# Authentication Errors

Unauthenticated

```
401
```

Example

```json
{
    "success": false,
    "error": {
        "code": "AUTHENTICATION_REQUIRED",
        "message": "Authentication required."
    }
}
```

---

# Authorization Errors

Authenticated

↓

No Permission

↓

```
403
```

Example

```json
{
    "success": false,
    "error": {
        "code": "PERMISSION_DENIED",
        "message": "You do not have permission to perform this action."
    }
}
```

---

# Not Found

Example

```json
{
    "success": false,
    "error": {
        "code": "LEAD_NOT_FOUND",
        "message": "Lead not found."
    }
}
```

---

# Conflict

Examples

Duplicate email

Duplicate slug

Duplicate invitation

↓

```
409 Conflict
```

---

# Rate Limiting

Protected endpoints

```
Authentication

Public Forms

Password Reset
```

Response

```
429 Too Many Requests
```

---

# Idempotency

GET

PUT

DELETE

should be idempotent.

POST generally is not.

Future

Idempotency keys for imports and payments.

---

# File Uploads

Uploads use

```
multipart/form-data
```

Metadata remains JSON.

---

# API Headers

Standard

```
Content-Type

Authorization

Accept

X-Request-ID
```

Future

Idempotency-Key

---

# Request ID

Every request receives

```
X-Request-ID
```

Useful for

Logs

Debugging

Support

Tracing

---

# Logging

Log

Request ID

Route

Duration

Status Code

User ID

Organization ID

Never log

Passwords

Tokens

Cookies

Sensitive payloads

---

# Response Time Goals

Simple GET

```
<150ms
```

Complex Search

```
<300ms
```

Dashboard

```
<500ms
```

Targets exclude network latency.

---

# API Documentation

Every endpoint documents

Purpose

Permissions

Parameters

Body

Responses

Errors

Examples

OpenAPI generation may be added later.

---

# API Testing

Every endpoint requires

Unit Tests

Validation Tests

Integration Tests

Authorization Tests

Error Tests

---

# Security

Always validate

Authentication

Authorization

Organization Context

Input

Ownership

Never trust

Client IDs

Hidden fields

Query parameters

---

# Future Features

Architecture supports

OpenAPI

SDK Generation

GraphQL Gateway

API Keys

Webhooks

Version 2

without changing endpoint conventions.

---

# Design Principles

APIs should be

Simple

Predictable

Consistent

Self-explanatory

Developers should rarely need to inspect implementation code to understand an endpoint.

---

# Success Criteria

Every endpoint should

Behave consistently

Return predictable responses

Expose meaningful errors

Be easy to document

Be easy to test

without leaking implementation details.

---

End of API Standards & Error Handling Guide
