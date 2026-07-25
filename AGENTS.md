<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# SalesPilot AI Development Guide

This document defines how AI coding agents should work on this repository.

---

## Read Before Writing Code

Before implementing any feature, read the documentation in this order.

1. docs/00-project-overview.md
2. docs/02-architecture.md
3. docs/03-folder-structure.md
4. docs/04-tech-stack.md
5. docs/05-design-system.md
6. docs/24-api-standards.md
7. docs/25-database-schema.md
8. docs/28-coding-standards.md

Then read the feature-specific document (Leads, Dashboard, Forms, etc.) before making changes.

Never skip these documents.

---

# Next.js Version Notice

This project uses the latest version of Next.js.

Do not assume APIs, conventions, or project structure from your training data.

Before implementing any Next.js feature, read the relevant documentation under

node_modules/next/dist/docs/

and follow the current APIs and deprecation guidance.

If the documentation conflicts with prior knowledge, always follow the documentation.

---

# Architecture Rules

Follow the documented architecture exactly.

- Server Components by default
- Client Components only when required
- Vertical Slice Architecture
- Service Layer
- Repository Pattern
- DTOs for API responses
- Zod validation
- React Hook Form
- TanStack Query for server state
- Better Auth for authentication
- Prisma for database access

Do not introduce new architectural patterns unless explicitly requested.

---

# Before Coding

Understand the feature first.

Review:

- related documentation
- existing implementation
- neighboring modules

Do not immediately start writing code.

---

# Code Quality

Write production-ready code.

Avoid placeholders.

Avoid TODO implementations.

Avoid mock implementations unless explicitly requested.

Complete the feature fully.

---

# Preserve Consistency

Follow existing

- naming
- folder structure
- component structure
- import ordering
- styling
- API conventions

Never introduce inconsistent patterns.

---

# Before Creating New Files

Ask yourself:

- Does something similar already exist?
- Can an existing abstraction be reused?
- Is this aligned with the architecture?

Prefer extending existing modules over creating new ones.

---

# UI Rules

Follow the Design System documentation.

Never invent spacing, typography, or colors.

Use existing UI components whenever possible.

Accessibility is required.

---

# API Rules

Always follow docs/24-api-standards.md.

Never expose Prisma models directly.

Always return DTOs.

Use the standard API response envelope.

---

# Database Rules

Always follow docs/25-database-schema.md.

Repositories contain only persistence logic.

Business rules belong in Services.

---

# Testing

Every business change should include appropriate tests.

Bug fixes should include regression tests.

---

# Security

Always

- validate input
- authenticate users
- authorize actions

Never trust client input.

---

# When Unsure

Do not guess.

Read the relevant project documentation first.

If documentation is missing, ask before introducing a new pattern.


# Implementation Workflow

For every feature, follow this sequence:

1. Read the relevant documentation.
2. Understand existing architecture.
3. Identify reusable components.
4. Create a short implementation plan.
5. Wait for approval if the task is ambiguous.
6. Implement incrementally.
7. Verify TypeScript types.
8. Run linting.
9. Run tests when applicable.
10. Review the implementation against project conventions before finishing.
