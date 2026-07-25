# docs/00-project-overview.md

# SalesPilot

Version: 1.0.0

Status: Architecture Frozen

---

# Vision

SalesPilot is a modern multi-tenant Lead Management SaaS designed for small and medium-sized businesses.

The product enables organizations to capture leads from customizable public forms, assign them to managers and team members, track every interaction through a complete activity history, and manage the entire lead lifecycle from a clean, fast and modern CRM dashboard.

Although the current implementation exposes only a single seeded organization, the architecture must be fully SaaS-ready. Every business decision should assume that multiple organizations will eventually exist without requiring major database or architectural changes.

The goal of this project is not merely to satisfy the assignment requirements but to demonstrate production-quality engineering decisions, scalable architecture, thoughtful UX, and maintainable code.

---

# Guiding Principles

Every engineering decision must follow these principles.

## 1. Production First

This project should resemble software that could realistically become a commercial SaaS product.

Avoid shortcuts that would prevent future scaling.

---

## 2. Developer Experience

The codebase should be enjoyable to work with.

Prioritize:

- Predictable folder structure
- Strong typing
- Consistent naming
- Small focused files
- Reusable abstractions
- Minimal boilerplate

---

## 3. Type Safety

Everything should be strongly typed.

Never use:

```ts
any
```

Avoid unnecessary type assertions.

Infer types whenever possible.

Every API should expose typed request and response contracts.

---

## 4. Server Is Source of Truth

Never trust the client.

The frontend is responsible only for presentation.

Every permission check must occur on the server.

Every validation must occur on the server.

Never rely on hidden UI elements for authorization.

---

## 5. Simplicity Over Cleverness

Readable code always wins.

Avoid unnecessary abstractions.

Avoid over-engineering.

Every file should be understandable by a new developer within a few minutes.

---

## 6. Vertical Feature Ownership

Every business domain owns its own implementation.

Example

Authentication owns:

- components
- validation
- repositories
- permissions
- services
- hooks

Lead Management owns:

- components
- validation
- repositories
- permissions
- actions

Avoid giant shared folders containing unrelated business logic.

---

# Product Overview

SalesPilot consists of three major experiences.

## Marketing Website

Public landing page introducing the product.

Includes:

- Hero
- Features
- Product Preview
- Pricing
- FAQ
- CTA
- Authentication

---

## Public Lead Forms

Organizations publish forms publicly.

Visitors submit information.

Submission immediately creates a Lead.

No review queue exists.

Each form belongs to exactly one organization.

Each form automatically routes leads to a configured manager.

---

## CRM Dashboard

Authenticated application.

Role-based.

Primary modules:

- Dashboard
- Leads
- Duplicate Leads
- Lead Forms
- Members
- Organization Settings
- Notifications
- Profile

---

# Project Goals

The implementation should demonstrate:

✓ Modern Next.js architecture

✓ Excellent TypeScript

✓ Secure authentication

✓ Role Based Access Control

✓ Multi-tenant database design

✓ REST API

✓ Clean UI

✓ Responsive layouts

✓ Proper validation

✓ Activity tracking

✓ Soft deletes

✓ Testability

---

# Non Goals

The following features are intentionally excluded.

- Billing
- Subscription management
- API Keys
- Webhooks
- Team switching
- Organization switching
- Workflow automation
- Email campaigns
- Analytics platform
- Mobile application
- Real-time collaboration
- Live chat
- AI lead scoring

The architecture should allow these features later without significant rewrites.

---

# Multi-Tenant Strategy

Only one organization is exposed in the current application.

However the architecture must assume:

One User

↓

Many Organization Memberships

↓

Different Roles

↓

Different Permissions

No part of the database may assume only one organization exists.

---

# Target Users

Primary

- Sales Teams

Secondary

- Small Businesses

Future

- Agencies
- Startups
- Consultants

---

# Core Features

Authentication

Organizations

Invitations

Role Based Access Control

Managers

Members

Lead Management

Public Lead Forms

Custom Fields

Lead Assignment

Activity Timeline

Duplicate Detection

Lead Merge

Notifications

Attachments

Search

Dashboard

Branding

---

# Technology Philosophy

Choose boring, proven technology.

Avoid experimental frameworks.

Prioritize long-term maintainability.

---

# Engineering Principles

Every feature must include:

- Loading State
- Empty State
- Error State
- Success State
- Permission Checks
- Validation
- Activity Logging

Nothing is considered complete until all states exist.

---

# Soft Delete Policy

Every business entity should support soft deletion unless there is a compelling reason otherwise.

Soft deleted records should never appear in normal application queries.

---

# Activity First

Every meaningful business action creates an Activity.

Examples

Lead Created

Lead Updated

Lead Assigned

Lead Status Changed

Lead Merged

Lead Deleted

Member Invited

Member Removed

Role Updated

Activities are immutable.

Activities are never edited.

---

# UX Philosophy

SalesPilot should feel closer to:

- Linear
- Attio
- Stripe Dashboard
- Vercel Dashboard

Avoid looking like:

- Bootstrap Admin
- AdminLTE
- Generic CRM Templates

The product should feel premium, minimal and fast.

---

# Accessibility

Every page must satisfy WCAG AA standards.

Keyboard navigation is mandatory.

Dialogs must trap focus.

Every input requires labels.

Color cannot be the only communication mechanism.

---

# Performance Goals

Initial load should be fast.

Use Server Components wherever appropriate.

Avoid unnecessary client components.

Lazy load large modules.

Optimize images.

Avoid unnecessary re-renders.

---

# Final Philosophy

If a reviewer asks,

"Could this become a real SaaS?"

the answer should be

"Yes."

Every architectural decision throughout this repository should reinforce that goal.
