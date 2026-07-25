# docs/22-authentication-implementation.md

# Authentication Implementation Guide

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines how authentication is implemented throughout SalesPilot.

Authentication is responsible for

- Identity
- Sessions
- Login
- Registration
- OAuth
- Invitations
- Email Verification
- Password Management

Business modules should never communicate directly with Better Auth.

---

# Design Goals

Authentication should be

✓ Secure

✓ Provider Agnostic

✓ Stateless

✓ Easy to Extend

✓ Easy to Test

✓ Multi-Tenant Aware

---

# Architecture

```
Client

↓

Route Handler

↓

Auth Service

↓

Better Auth

↓

Database

↓

Session
```

Only the Auth Service communicates with Better Auth.

---

# Responsibilities

Auth Service

- Login
- Register
- Logout
- Get Session
- Get Current User
- OAuth
- Invitations
- Email Verification
- Password Reset

Business modules depend only on Auth Service.

---

# Authentication Flow

```
User

↓

Login

↓

Better Auth

↓

Session

↓

Cookie

↓

Authenticated Requests
```

---

# Registration Flow

```
Register

↓

Validate Input

↓

Create User

↓

Send Verification Email

↓

Verify Email

↓

Create Organization

↓

Create Owner Membership

↓

Login
```

Email verification is required before accessing protected resources.

---

# Login Flow

```
Email

↓

Password

↓

Better Auth

↓

Session

↓

Cookie

↓

Dashboard
```

---

# OAuth Flow

Supported Providers

```
Google
```

Future

```
GitHub

Microsoft

Apple
```

---

# Google Login

```
Google

↓

Better Auth

↓

User Lookup

↓

Existing?

↓

Create or Link

↓

Session

↓

Dashboard
```

---

# OAuth Account Linking

Automatic linking is **not** allowed.

Instead

```
Existing Account

↓

Google Login

↓

Verify Password

↓

Link Account

↓

Success
```

This prevents account takeover through matching email addresses.

---

# Session Management

Sessions contain only

```
Session ID

User ID

Expiration
```

Organization and permissions are resolved per request.

Avoid storing authorization data inside sessions.

---

# Cookie Configuration

Recommended

```
HttpOnly

Secure

SameSite=Lax

Signed

Encrypted
```

Never expose session tokens to JavaScript.

---

# Session Lifecycle

```
Login

↓

Session Created

↓

Requests

↓

Logout

↓

Session Invalidated
```

Expired sessions require re-authentication.

---

# Session Resolution

Every authenticated request

```
Cookie

↓

Session

↓

User

↓

Organization

↓

Permissions
```

Session lookup happens before authorization.

---

# Auth Service Interface

Example

```ts
interface AuthService {
    login()
    logout()
    register()
    getSession()
    getCurrentUser()
    requireUser()
}
```

Business services depend only on this interface.

---

# Current User

Example

```ts
const user = await auth.getCurrentUser()
```

Avoid calling Better Auth directly throughout the application.

---

# Route Protection

Public Routes

```
/

/pricing

/login

/register

/forms/*
```

Protected Routes

```
/dashboard

/settings

/members

/leads

/forms/manage
```

---

# Middleware Order

```
Request

↓

Authentication

↓

Organization Resolution

↓

Authorization

↓

Validation

↓

Business Logic
```

Authentication always comes first.

---

# Multi-Tenant Resolution

Authentication identifies

```
User
```

Organization resolution identifies

```
Organization Membership
```

These are separate responsibilities.

---

# Organization Selection

Future

If a user belongs to multiple organizations

```
Login

↓

Organization Selector

↓

Dashboard
```

Version 1 assumes a single organization per user.

---

# Email Verification

Flow

```
Register

↓

Email Sent

↓

Verification Link

↓

Verified

↓

Dashboard
```

Protected routes require verified email addresses.

---

# Password Requirements

Minimum

```
8 Characters
```

Recommended

Uppercase

Lowercase

Number

Special Character

Passwords are hashed by Better Auth.

---

# Password Reset

Flow

```
Forgot Password

↓

Email

↓

Reset Link

↓

New Password

↓

Success
```

Reset links expire automatically.

---

# Logout

Flow

```
Logout

↓

Invalidate Session

↓

Clear Cookie

↓

Redirect Login
```

Logout affects only the current session.

Future

Logout from all devices.

---

# Invitation Flow

```
Admin Invites

↓

Email

↓

Accept Invitation

↓

Create Password

↓

Join Organization

↓

Login
```

Invitation tokens expire.

---

# Invitation Rules

Invitations

- Are single-use
- Expire automatically
- Are organization scoped
- Cannot be reused

---

# Email Change

Future

```
Request Change

↓

Verification Email

↓

Confirm

↓

Update Email
```

Changing an email requires verification.

---

# Account Deletion

Future

```
Verify Password

↓

Delete Account

↓

Invalidate Sessions

↓

Soft Delete
```

Owners must transfer ownership before deletion.

---

# Rate Limiting

Protect

```
Login

Register

Forgot Password

Verification

OAuth Callback
```

Prevent brute-force attacks.

---

# Security Headers

Use

```
CSRF Protection

CSP

HSTS

X-Frame-Options

X-Content-Type-Options
```

Follow Next.js security recommendations.

---

# Error Responses

Authentication Required

```
401 Unauthorized
```

Invalid Credentials

```
400 Bad Request
```

Permission Denied

```
403 Forbidden
```

Do not reveal whether an email exists.

---

# Logging

Log

Login Success

Login Failure

Logout

Password Reset

OAuth Login

Invitation Accepted

Do not log passwords, tokens, or cookies.

---

# Testing Strategy

Unit Tests

Auth Service

Session Resolution

OAuth Linking

Integration Tests

Protected Routes

Invitation Flow

Password Reset

End-to-End

Complete authentication lifecycle.

---

# Client Hooks

Recommended

```ts
useSession()

useCurrentUser()

useLogout()
```

Avoid exposing Better Auth hooks directly to feature modules.

---

# Server Helpers

Recommended

```ts
requireUser()

requireVerifiedUser()

requireOrganization()

requirePermission()
```

Keep route handlers concise.

---

# API Endpoints

Examples

```
POST /auth/login

POST /auth/register

POST /auth/logout

POST /auth/forgot-password

POST /auth/reset-password

GET /auth/session
```

OAuth endpoints are managed by Better Auth.

---

# Future Features

Architecture supports

Passkeys

Two-Factor Authentication

Magic Links

Device Management

Session Management

Multi-Organization Switching

without redesigning the Auth Service.

---

# Design Principles

Authentication identifies users.

Authorization determines permissions.

Sessions remain lightweight.

Business modules never depend on Better Auth directly.

Replacing the authentication provider should require changes only inside the Auth Service.

---

# Success Criteria

The authentication system should

Be secure

Be easy to maintain

Support future providers

Support future authentication methods

Remain independent from business modules

without leaking authentication implementation details throughout the codebase.

---

End of Authentication Implementation Guide
