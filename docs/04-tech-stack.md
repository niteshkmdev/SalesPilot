# docs/04-tech-stack.md

# Technology Stack & Engineering Standards

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines every technology used in SalesPilot.

Technology choices are frozen.

Contributors should not replace libraries without documenting an Architecture Decision Record (ADR).

The goal is consistency, maintainability and long-term scalability—not chasing the newest framework.

---

# Technology Philosophy

When selecting libraries, prioritize:

✓ Mature

✓ Well documented

✓ Large community

✓ Excellent TypeScript support

✓ Production ready

Avoid adding dependencies that solve very small problems.

Every dependency increases maintenance cost.

---

# Core Stack

| Layer | Technology |
|---------|------------|
| Framework | Next.js 15+ App Router |
| Language | TypeScript |
| Runtime | Node.js LTS |
| Package Manager | pnpm |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Forms | React Hook Form |
| Validation | Zod |
| Data Fetching | TanStack Query |
| Authentication | Better Auth |
| Database | MongoDB |
| ORM | Prisma |
| Charts | Recharts |
| Rich Text | MDX Editor |
| Email Templates | React Email |
| Storage | S3 Compatible Storage |
| Search | MongoDB Atlas Search |
| Notifications | In-App |
| Testing | Vitest + Playwright |
| Linting | ESLint |
| Formatting | Prettier |

No additional major libraries should be introduced without strong justification.

---

# Framework

## Next.js

Use the App Router.

Never use the Pages Router.

Application should leverage:

- Server Components
- Client Components
- Route Handlers
- Streaming
- Layouts
- Route Groups
- Metadata API

Avoid unnecessary client-side rendering.

---

# Language

TypeScript is mandatory.

Rules

✓ strict mode

✓ noImplicitAny

✓ exactOptionalPropertyTypes

✓ strictNullChecks

Never disable strict typing.

Never suppress errors using

```ts
// @ts-ignore
```

unless there is no alternative and the reason is documented.

---

# Package Manager

Use

```
pnpm
```

Never use

```
npm

yarn

bun
```

within this repository.

---

# Styling

Tailwind CSS v4

Use utility classes.

Avoid custom CSS.

Allowed

- globals.css
- tokens.css

Avoid

```
Button.css

Dashboard.css

LeadTable.css
```

No CSS Modules.

No SCSS.

No styled-components.

---

# UI Library

Use

shadcn/ui

as the design foundation.

Components may be customized.

Do not blindly accept default styling.

The visual language should resemble:

- Linear
- Attio
- Vercel
- Stripe Dashboard
- Notion

Avoid the appearance of a default shadcn installation.

---

# Icons

Lucide React

Only.

Avoid mixing icon libraries.

Never use emojis as UI icons.

---

# Forms

All forms use

React Hook Form

Validation

↓

Zod

Never use uncontrolled HTML forms for application features.

---

# Validation

Every request validates with Zod.

Validation happens

Server

AND

Client.

Never duplicate schema definitions.

Schemas should be shared whenever possible.

---

# Database

MongoDB

via

Prisma ORM

Never use the native Mongo driver.

All persistence goes through Prisma.

---

# Authentication

Better Auth

Responsibilities

✓ Sessions

✓ OAuth

✓ Password Login

✓ Password Reset

✓ Email Verification

SalesPilot responsibilities

✓ Organizations

✓ Memberships

✓ Invitations

✓ RBAC

Keep authentication and authorization separate.

---

# Authorization

Permissions are stored in the database.

Never hardcode permissions.

Every API validates permissions.

Every mutation validates permissions.

Never trust frontend visibility.

---

# State Management

Client state

↓

React

Remote state

↓

TanStack Query

Forms

↓

React Hook Form

Global state libraries

(Redux, Zustand, MobX)

are intentionally excluded.

If state cannot be managed with React Context or TanStack Query, reconsider the architecture before introducing another dependency.

---

# Charts

Recharts

Dashboard widgets

Pipeline

Lead Sources

Conversion Rate

No Chart.js.

No ApexCharts.

Keep visualizations minimal.

---

# Rich Text

Lead notes use

MDX Editor

Supported

- Bold
- Italic
- Lists
- Links
- Code
- Images
- Attachments

Unsupported

- Tables
- Collaboration
- Comments
- Mentions

---

# Search

Primary

MongoDB Atlas Search

Fallback

Regex

Search implementation must be abstracted.

Business modules should not know which search engine is used.

---

# Storage

S3 Compatible Storage

Configured entirely through environment variables.

Supported providers

AWS S3

Cloudflare R2

MinIO

DigitalOcean Spaces

Modules should interact only with Storage Service.

---

# Email

React Email

Emails are minimal.

Invitation

Password Reset

Verification

Future expansion should not require changing architecture.

---

# Notifications

Only

In-App

No email notifications.

No push notifications.

No WebSockets.

Architecture should allow future notification channels.

---

# Logging

Current implementation

```
console
```

All logging should go through a logger abstraction.

Future replacement

Pino

should require minimal changes.

---

# Testing

Unit

↓

Vitest

End-to-End

↓

Playwright

Testing Library

↓

React Testing Library

Every business feature should be testable.

---

# Linting

ESLint

Zero warnings.

Zero errors.

Never disable rules globally.

---

# Formatting

Prettier

Formatting should never be discussed during code review.

---

# Environment Variables

All configuration belongs in

```
.env
```

Every variable must be documented in

```
.env.example
```

No secrets should ever appear in source control.

---

# File Upload Limits

Default maximum

10 MB

Allowed

Images

PDF

Office Documents

Future expansion should be configurable.

---

# Browser Support

Latest

Chrome

Firefox

Safari

Edge

Internet Explorer is not supported.

---

# Accessibility

Every component must satisfy

WCAG AA

Requirements

Keyboard Navigation

Visible Focus

ARIA Labels

Screen Reader Friendly

Semantic HTML

---

# Performance Targets

Initial page load should prioritize server rendering.

Guidelines

✓ Use Server Components by default.

✓ Lazy load heavy components.

✓ Optimize images.

✓ Avoid unnecessary client bundles.

✓ Minimize hydration.

---

# Dependency Guidelines

Before adding a dependency ask:

1. Can this be solved with native JavaScript?

2. Can an existing dependency solve it?

3. Is the library actively maintained?

4. Does it support TypeScript?

5. Does it justify the bundle size?

If the answer is "no" to any of these, avoid adding it.

---

# Engineering Principles

Technology choices should optimize for:

Readability

Maintainability

Performance

Developer Experience

Scalability

Type Safety

Not novelty.

The objective is to build software that a production engineering team could confidently maintain.

---

# Frozen Decisions

The following decisions are considered final.

Framework

✓ Next.js App Router

Language

✓ TypeScript

Database

✓ MongoDB

ORM

✓ Prisma

Authentication

✓ Better Auth

Styling

✓ Tailwind CSS

UI

✓ shadcn/ui

Forms

✓ React Hook Form

Validation

✓ Zod

Data Fetching

✓ TanStack Query

Charts

✓ Recharts

Search

✓ MongoDB Atlas Search

Storage

✓ S3 Compatible Storage

Notifications

✓ In-App Only

API

✓ REST

Architecture

✓ Vertical Slice

Logging

✓ Console (through logger abstraction)

---

# Future Technology Considerations

The architecture should allow future adoption of:

- Redis
- BullMQ
- Pino
- OpenTelemetry
- WebSockets
- Background Workers
- Multi-region deployments

without requiring significant refactoring.

These are intentionally out of scope for version 1.0.

---

End of Technology Stack Document
