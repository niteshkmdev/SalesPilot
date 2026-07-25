# docs/28-coding-standards.md

# Coding Standards & Development Guidelines

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines the engineering standards used throughout SalesPilot.

The goal is to ensure the codebase remains

- Consistent
- Readable
- Predictable
- Maintainable
- Easy to onboard into

These standards apply to every contributor regardless of experience.

---

# Engineering Principles

Every piece of code should strive to be

✓ Simple

✓ Explicit

✓ Testable

✓ Type Safe

✓ Reusable

✓ Maintainable

---

# General Philosophy

Prefer

```
Simple

↓

Readable

↓

Maintainable
```

instead of

```
Short

↓

Clever

↓

Complex
```

Code is read far more often than it is written.

---

# SOLID Principles

Services should generally follow

- Single Responsibility
- Dependency Inversion
- Interface Segregation

Do not blindly apply every SOLID principle.

Use them where they improve maintainability.

---

# File Size

Recommended limits

```
Component

<300 Lines

Service

<250 Lines

Repository

<200 Lines

Utility

<150 Lines
```

Large files usually indicate multiple responsibilities.

---

# Function Size

Aim for

```
20–40 Lines
```

Large functions should be split into smaller, meaningful units.

---

# Function Naming

Functions should describe behavior.

Good

```ts
createLead()

assignLead()

archiveLead()

publishForm()
```

Avoid

```ts
handle()

process()

execute()

run()
```

---

# Variable Naming

Use descriptive names.

Good

```ts
assignedMember

organizationContext

leadStatus
```

Avoid

```ts
obj

data

item

temp

value
```

---

# Boolean Naming

Prefix with

```
is

has

can

should
```

Examples

```ts
isArchived

hasPermission

canAssign

shouldNotify
```

---

# Constants

Avoid magic values.

Instead

```ts
const MAX_UPLOAD_SIZE = 25 * MB
```

instead of

```ts
26214400
```

---

# TypeScript

Use

```
strict: true
```

Avoid

```
any
```

Prefer

```
unknown
```

when necessary.

---

# Interfaces

Use interfaces for contracts.

Example

```ts
interface StorageService {}

interface SearchService {}
```

---

# Type Aliases

Use type aliases for

Unions

Mapped Types

Utility Types

Examples

```ts
type LeadStatus = ...
```

---

# Enums

Avoid TypeScript enums.

Prefer

```ts
const NotificationType = {
    ...
} as const
```

This aligns better with modern TypeScript patterns.

---

# Imports

Order

```
Node

Third Party

Shared

Local
```

Separate groups with a blank line.

---

# Barrel Files

Allowed

```
index.ts
```

Only for public module exports.

Avoid deeply nested barrel chains.

---

# Path Aliases

Use

```ts
@/modules

@/shared

@/server
```

Avoid long relative imports.

---

# Components

Prefer

Small

Focused

Reusable

Each component should have a single responsibility.

---

# React Components

Prefer

Server Components

↓

Client Components only when needed.

Avoid unnecessary `"use client"` directives.

---

# Hooks

Custom hooks should

- Encapsulate reusable logic
- Never perform business logic
- Remain UI-focused

Examples

```ts
usePermission()

useDashboardMetrics()

useLeadFilters()
```

---

# State Management

Prefer

Server State

↓

TanStack Query

Local UI State

↓

React State

Avoid unnecessary global state.

---

# Forms

Standard

React Hook Form

+

Zod

Every form follows the same architecture.

---

# Validation

Validation belongs in

```
Zod Schemas
```

Business services should never parse raw request data.

---

# Business Logic

Business rules belong in

```
Services
```

Never in

React Components

Route Handlers

Repositories

---

# Repository Rules

Repositories

✓ CRUD

✓ Queries

✓ Transactions

Repositories never

- Validate
- Authorize
- Send notifications
- Create activities

---

# Service Rules

Services

Validate business rules

Coordinate repositories

Publish domain events

Return DTOs

---

# Route Handlers

Route handlers should

Authenticate

Validate

Call Service

Return Response

Nothing else.

---

# Error Handling

Throw

Domain-specific errors.

Avoid returning

```
null

undefined

false
```

for exceptional situations.

---

# Logging

Use the application's logging abstraction.

Never

```
console.log()
```

inside production code.

Console logging is acceptable in local development only.

---

# Comments

Prefer

Good code

over comments.

Comments should explain

Why

not

What

---

# TODOs

Format

```ts
// TODO(username): description
```

Example

```ts
// TODO(nitesh): Add webhook support
```

---

# Formatting

Enforce

Prettier

Automatically.

Never debate formatting in code reviews.

---

# Linting

ESLint is mandatory.

Warnings should be treated seriously.

Errors block merges.

---

# Naming Conventions

Files

```
lead-service.ts

lead.repository.ts

lead.mapper.ts
```

React Components

```
LeadTable.tsx

DashboardCard.tsx
```

---

# Folder Structure

Follow

Vertical Slice Architecture.

Never create generic folders like

```
helpers/

misc/

utils2/
```

without a clear purpose.

---

# Dependency Direction

```
UI

↓

Application

↓

Domain

↓

Infrastructure
```

Never reverse dependencies.

---

# API Contracts

Never expose

Prisma models

Database entities

Internal enums

Always return DTOs.

---

# Date Handling

Store

UTC

Transmit

ISO-8601

Convert to local time only in the UI.

---

# Environment Variables

Access environment variables through

A centralized configuration module.

Avoid scattered

```
process.env
```

calls.

---

# Feature Flags

Future

Introduce a Feature Flag service.

Avoid checking random environment variables throughout the application.

---

# Code Reviews

Every PR should verify

Correctness

Readability

Architecture

Naming

Testing

Performance

Security

Maintainability

---

# Pull Request Size

Recommended

```
<500 Lines
```

Large PRs are harder to review.

Prefer smaller, focused changes.

---

# Commit Messages

Recommended format

```
feat: add lead merge workflow

fix: validate invitation token

refactor: simplify dashboard service

test: add authorization integration tests
```

Follow Conventional Commits.

---

# Documentation

Every module should contain

README (if needed)

Architecture Notes

Complex decisions

Avoid documenting obvious code.

---

# Dependency Management

Before adding a package

Ask

- Can existing code solve this?
- Is the dependency actively maintained?
- Is it widely adopted?
- Does it increase bundle size?

Prefer fewer dependencies.

---

# Performance

Avoid

Premature optimization.

Optimize only after measuring.

Use profiling before refactoring for performance.

---

# Security

Never trust

Client Input

JWT Claims Alone

Query Parameters

Hidden Fields

Always validate

Authenticate

Authorize

---

# Accessibility

UI components should support

Keyboard Navigation

Screen Readers

Visible Focus

Semantic HTML

Accessibility is a default requirement.

---

# Testing Expectations

New business logic

↓

Requires tests.

Bug fixes

↓

Require regression tests.

---

# Refactoring

Leave code better than you found it.

Prefer incremental improvements over massive rewrites.

---

# Design Principles

Consistency is more valuable than personal preference.

Engineering decisions should optimize for long-term maintainability rather than short-term convenience.

---

# Success Criteria

The codebase should

Be approachable for new developers

Remain consistent across modules

Support rapid feature development

Encourage clean architecture

Minimize technical debt

without requiring extensive onboarding or frequent rewrites.

---

End of Coding Standards & Development Guidelines
