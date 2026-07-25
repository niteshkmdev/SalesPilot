# docs/14-lead-forms.md

# Lead Forms Module

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

Lead Forms allow organizations to capture leads through publicly accessible forms.

Every submission creates a Lead inside SalesPilot while preserving the original submission for analytics and auditing.

Lead Forms are organization-scoped and support branding, configurable fields, and assignment rules.

---

# Design Goals

The Lead Forms module should be

✓ Easy to create

✓ Easy to share

✓ Mobile friendly

✓ Fast

✓ Secure

✓ Extensible

Forms should require no technical knowledge to configure.

---

# Core Concepts

Organization

↓

Lead Form

↓

Public Submission

↓

Lead

↓

Activity

↓

Notification

Every submission becomes a Lead.

---

# Form Lifecycle

Every form has one of three states.

```
Draft

↓

Published

↓

Archived
```

---

# Draft

Characteristics

- Private
- Preview only
- Editable
- Not indexed
- No public URL

Only authenticated users with permission may preview draft forms.

---

# Published

Characteristics

- Public
- Accepts submissions
- Search engine indexing configurable
- Shareable URL

Example

```
https://salespilot.com/forms/contact-us
```

---

# Archived

Characteristics

- No longer accepts submissions
- Public URL returns 404
- Editable after restoration
- Historical submissions remain available

---

# Form Ownership

Each form belongs to

```
Organization
```

Each form has

Created By

Updated By

Assigned Manager (optional)

---

# Form Structure

Every form contains

Name

Slug

Description

Status

Fields

Branding

Assignment Rules

Submission Settings

---

# Public URL

Generated from

```
/forms/{slug}
```

Slug must be unique within an organization.

---

# Form Fields

Default fields

First Name

Last Name

Email

Phone

Company

Message

Organizations may add custom fields.

---

# Supported Field Types

Version 1

Text

Textarea

Email

Phone

Number

Future

Date

Select

Checkbox

Radio

File Upload

Multi Select

Hidden Fields

---

# Required Fields

Organizations may mark fields as

Required

or

Optional

Validation occurs

Client

↓

Server

---

# Field Validation

Supported

Required

Email Format

Phone Format

Maximum Length

Minimum Length

Numeric Validation

Custom validation rules are out of scope.

---

# Field Order

Fields are sortable.

Drag and drop ordering.

Stored as

```
displayOrder
```

---

# Custom Fields

Organization-defined fields may be added to forms.

Examples

Industry

Budget

Country

Preferred Contact Time

Values become part of the created Lead.

---

# Branding

Forms inherit organization branding.

Includes

Logo

Primary Color

Accent Color

Typography

Organizations may optionally override branding per form in the future.

---

# Submission Flow

Visitor

↓

Open Form

↓

Fill Fields

↓

Turnstile Verification

↓

Server Validation

↓

Submission Stored

↓

Lead Created

↓

Activity Created

↓

Success Page

---

# Spam Protection

Every public submission passes through

Cloudflare Turnstile

Requests failing verification are rejected.

---

# Rate Limiting

Public forms should be rate limited.

Purpose

Prevent spam

Prevent abuse

Protect infrastructure

---

# Success Screen

After submission

Display

Success Icon

Confirmation Message

Optional CTA

Example

```
Thank you!

Your information has been received.
Our team will contact you soon.
```

---

# Error Screen

Validation errors display inline.

Unexpected failures display

```
Something went wrong.

Please try again.
```

Never expose internal server errors.

---

# Lead Creation

Successful submission creates

Form Submission

↓

Lead

↓

Activity

↓

Notification (optional)

Creation should be atomic.

Either everything succeeds or nothing does.

---

# Form Submission Record

Submission records are immutable.

Purpose

Analytics

Spam Investigation

Historical Record

Audit Trail

Submissions should never be edited.

---

# Assignment Rules

A form may define

Default Manager

Default Member (future)

Round Robin (future)

Load Balancing (future)

Version 1 supports a single default manager.

---

# Duplicate Detection

Submission checks

Email

Phone

If duplicate detected

Create Lead

↓

Mark Duplicate

↓

Activity

Submission is never blocked.

---

# Notifications

Organizations may notify

Assigned Manager

Organization Admins (future)

Notification example

```
New Lead Submitted

Website Contact Form

2 minutes ago
```

---

# Preview Mode

Draft forms support preview.

Only authenticated users may access preview.

Preview URLs should not be indexed.

---

# Sharing

Published forms may be shared via

Website

Email

QR Code (future)

Social Media

The URL remains stable unless the slug changes.

---

# Search Engine Indexing

Per-form option

Allow Indexing

Default

Disabled

Useful for embedded lead forms that should not appear in search results.

---

# Form Settings

Supported

Name

Description

Slug

Status

Assignment

Branding

Indexing

Future

Thank You Redirect

Submission Limits

Working Hours

Auto Responses

---

# Analytics

Version 1

Submission Count

Lead Count

Future

Conversion Rate

Views

Completion Rate

Drop-off Rate

Device Breakdown

Traffic Source

---

# Form List

Displays

Name

Status

Submissions

Created

Updated

Actions

Search

Sorting

Filtering

Pagination

---

# Filters

Status

Created By

Created Date

Updated Date

---

# Actions

View

Preview

Edit

Duplicate (future)

Archive

Delete (future)

---

# Permissions

Owner

Full access.

Admin

Manage all forms.

Manager

Create and manage forms if permitted.

Member

No access by default.

Permissions remain configurable through RBAC.

---

# API Endpoints

```
GET /lead-forms

GET /lead-forms/{id}

POST /lead-forms

PATCH /lead-forms/{id}

PATCH /lead-forms/{id}/archive

POST /forms/{slug}/submit
```

Future

```
GET /lead-forms/{id}/analytics
```

---

# Activity Timeline

Events

Form Created

Form Updated

Form Published

Form Archived

Submission Received

Assignment Changed

Activities are immutable.

---

# Accessibility

Forms must support

Keyboard Navigation

Visible Focus

ARIA Labels

Screen Readers

Error Announcements

Proper Label Association

---

# Mobile Experience

Single-column layout.

Large touch targets.

Responsive spacing.

Sticky submit button only if beneficial.

---

# Performance

Goals

Fast initial render

Server-side rendering

Minimal JavaScript

Lazy load non-critical assets

Public forms should remain usable on slow mobile connections.

---

# Security

Never trust client input.

Validate every field server-side.

Escape user-generated content.

Protect against spam.

Protect against automated submissions.

Do not expose organization information unnecessarily.

---

# Future Features

Architecture supports

Conditional Fields

Multi-Step Forms

File Uploads

Draft Saving

Auto Responses

Custom Redirect URLs

Webhook Integrations

Form Templates

Embedded Forms

without redesigning the module.

---

# Success Criteria

Organizations should be able to

Create a form in minutes

Publish instantly

Share publicly

Capture leads securely

Track submissions

Manage leads from a single workflow

The Lead Forms module should make lead capture effortless while remaining flexible enough to support future growth.

---

End of Lead Forms Module
