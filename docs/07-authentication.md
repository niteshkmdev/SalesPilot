# docs/07-authentication.md

# Authentication & Identity

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines every authentication flow within SalesPilot.

Authentication is responsible only for identity.

Authorization is handled separately by the RBAC system.

This separation must never be violated.

---

# Authentication Philosophy

Authentication answers

> Who are you?

Authorization answers

> What are you allowed to do?

These systems should remain completely independent.

---

# Authentication Provider

SalesPilot uses

Better Auth

Responsibilities

✓ Sessions

✓ Password Authentication

✓ Google OAuth

✓ Email Verification

✓ Password Reset

✓ Session Management

SalesPilot manages

✓ Organizations

✓ Membership

✓ Invitations

✓ Roles

✓ Permissions

---

# Supported Authentication Methods

SalesPilot supports

✓ Email + Password

✓ Google OAuth

Every account may eventually have both methods linked.

---

# Identity Model

One identity

↓

Many authentication providers

↓

Many organization memberships

```
User

↓

Better Auth Account

↓

OrganizationMember
```

A user may belong to multiple organizations.

Current implementation exposes only one.

---

# Session Strategy

Session stores

```
userId
```

Only.

The session must NOT store

- role
- permissions
- organization
- manager

Every request derives those values from the database.

Advantages

✓ No stale permissions

✓ Immediate role updates

✓ Simpler session invalidation

---

# Login Flow

Email

↓

Password

↓

Better Auth

↓

Load User

↓

Find Organization Membership

↓

Create Session

↓

Redirect Dashboard

---

# Signup Flow

Visitor

↓

Signup

↓

Verify Email

↓

Create Organization

↓

Create Owner Membership

↓

Seed Default Roles

↓

Seed Default Permissions

↓

Dashboard

The first user automatically becomes Owner.

---

# Google Signup

Visitor

↓

Google OAuth

↓

Create User

↓

Create Organization

↓

Owner Membership

↓

Dashboard

Google users do not require email verification.

Google is considered a verified identity provider.

---

# Invitation Flow

Admin

↓

Invite Member

↓

Email

↓

Secure Token

↓

Invitation Page

↓

Choose

Password

OR

Google

↓

Organization Membership Created

↓

Dashboard

Invitation automatically verifies email ownership.

---

# Invitation Expiration

Every invitation expires.

Default

```
7 Days
```

Expired invitations cannot be reused.

Admins may resend invitations.

---

# Invitation Tokens

Tokens should

✓ Be cryptographically secure

✓ Be single use

✓ Expire

Never expose sequential identifiers.

---

# Password Requirements

Minimum

```
8 Characters
```

Require

Uppercase

Lowercase

Number

Special Character

Future versions may expose configurable password policies.

---

# Forgot Password

User

↓

Enter Email

↓

Email Sent

↓

Reset Link

↓

New Password

↓

Login

Reset links expire.

Single use only.

---

# Email Verification

Required

Password Signup

Not Required

Google Signup

Invitation Signup

Reason

Identity already verified.

---

# Google Account Linking

Scenario

Existing password account.

User clicks

Continue with Google.

Flow

Google Authentication

↓

Existing User Found

↓

Prompt Password

↓

Verify Password

↓

Link Google Account

↓

Create Session

↓

Dashboard

Never automatically link accounts.

---

# Why Password Confirmation?

Without password verification

Anyone with access to a Google account

could hijack an existing password account.

Password confirmation proves ownership.

---

# Cancel Linking

If user cancels password confirmation

↓

Google account remains unlinked

↓

No session created

↓

Return to Login

Never create partial account links.

---

# Google Only Accounts

Google-created accounts

may not have passwords.

Attempting password login should display

```
Password login is not enabled for this account.

Please continue with Google.
```

---

# Password Only Accounts

Until Google is linked

Google login should require password confirmation.

---

# Logout

Logout destroys

Session

Cookies

Temporary Tokens

Redirect

Login

---

# Session Lifetime

Rolling sessions.

Every authenticated request refreshes expiry.

Session duration managed by Better Auth.

---

# Remember Me

Supported.

Persistent session.

User controlled.

---

# Organization Resolution

After authentication

Find active organization membership.

Current implementation

First membership.

Future implementation

User selected organization.

---

# Removed Members

If a membership is removed

User identity still exists.

Organization membership no longer exists.

Login succeeds.

Organization lookup fails.

User sees

```
You are no longer a member of an organization.
```

Available actions

Create Organization

Redeem Invitation

Do NOT display

```
User does not exist.
```

The account still exists.

---

# Soft Deleted Membership

Soft deleted memberships

cannot access organization resources.

History remains preserved.

---

# Multiple Sessions

Allowed.

Desktop

Laptop

Mobile

Each session independently revocable.

---

# Session Security

Sessions should

Use Secure Cookies

HTTP Only

SameSite=Lax

CSRF protection enabled.

---

# Authentication Middleware

Middleware responsibilities

Check Session

↓

Check Authentication

↓

Continue

Authorization is NOT middleware responsibility.

Permissions belong to the application layer.

---

# Protected Routes

Authentication required

Dashboard

Leads

Forms

Settings

Notifications

Members

Public

Landing

Login

Signup

Public Forms

Invitation

Forgot Password

---

# Unauthorized Access

Unauthenticated users

↓

Redirect Login

Authenticated users without permission

↓

403 Forbidden

Never expose hidden routes.

---

# Email Templates

SalesPilot uses React Email.

Templates

Invitation

Verification

Password Reset

Future

Welcome Email

---

# Rate Limiting

Protect

Login

Signup

Forgot Password

Invitation Redemption

Google Callback

Use middleware or infrastructure.

---

# Audit Events

Authentication should create Activities where appropriate.

Examples

User Joined Organization

Invitation Accepted

Password Changed

Google Linked

Organization Created

Do not create activities for every login.

---

# Security Principles

Never trust the client.

Never expose tokens.

Never expose provider secrets.

Never log passwords.

Never log OAuth tokens.

Never expose stack traces.

---

# Error Messages

Avoid leaking information.

Good

```
Invalid email or password.
```

Bad

```
Email not found.
```

---

# Future Authentication Features

Supported by architecture

Magic Links

Passkeys

MFA

SSO

Enterprise Identity Providers

Session Dashboard

Trusted Devices

These are intentionally excluded from v1.

---

# Authentication Goals

The authentication system should be

✓ Secure

✓ Predictable

✓ Extensible

✓ Provider Agnostic

✓ Easy to Maintain

Authentication should feel invisible to users while remaining robust enough for production use.

---

End of Authentication Document
