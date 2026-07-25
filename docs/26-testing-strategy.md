# docs/26-testing-strategy.md

# Testing Strategy & Quality Assurance

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines the testing strategy for SalesPilot.

The objective is to build confidence that new features can be developed quickly without introducing regressions.

Testing should validate business behavior rather than implementation details.

---

# Design Goals

The testing strategy should be

✓ Reliable

✓ Fast

✓ Maintainable

✓ Deterministic

✓ Easy to Write

✓ Easy to Debug

---

# Testing Philosophy

Tests should verify

```
Behavior

↓

Not Implementation
```

Avoid testing

- Internal variables
- Private methods
- Framework internals

Test the observable behavior of the application.

---

# Testing Pyramid

```
                E2E

          Integration Tests

            Unit Tests
```

Approximate distribution

```
70% Unit

20% Integration

10% End-to-End
```

---

# Testing Layers

## Unit Tests

Test

- Pure functions
- Services
- Mappers
- Validators
- Utilities

Unit tests should not access

- Database
- Network
- File System

---

## Integration Tests

Test

- API Routes
- Repositories
- Prisma
- Authentication
- Authorization

Integration tests verify that components work together correctly.

---

## End-to-End Tests

Test complete user workflows.

Examples

```
Register

↓

Create Organization

↓

Create Lead

↓

Assign Lead

↓

Update Status

↓

Logout
```

These tests simulate real user interactions.

---

# Recommended Tools

Unit & Integration

```
Vitest
```

Mocking

```
vi.mock()
```

E2E

```
Playwright
```

Coverage

```
@vitest/coverage-v8
```

---

# Folder Structure

```
tests/

    unit/

    integration/

    e2e/

fixtures/

test-utils/
```

Tests should be separated by responsibility.

---

# Unit Testing

Focus on

Business rules

Examples

```
LeadService

ActivityService

AuthorizationService

SearchService

StorageService
```

---

# Repository Testing

Repositories should be tested with

A real test database.

Avoid mocking Prisma repositories.

---

# Service Testing

Mock

Repositories

Storage

Notification Service

Activity Service

Search Service

Do not mock the service under test.

---

# API Testing

Every endpoint should verify

Authentication

Authorization

Validation

Business Logic

Response Format

Error Handling

---

# Validation Testing

Every Zod schema should test

Valid Input

Invalid Input

Missing Fields

Boundary Values

Unexpected Fields

---

# Authentication Testing

Scenarios

Valid Login

Invalid Password

Expired Session

Email Verification

Invitation Acceptance

OAuth Flow

---

# Authorization Testing

Verify

Correct Permission

Missing Permission

Resource Ownership

Cross-Tenant Access

Owner Restrictions

---

# Multi-Tenant Testing

Critical scenarios

Organization A

↓

Cannot Access

↓

Organization B Data

Every repository and API should verify tenant isolation.

---

# Lead Module Tests

Examples

Create Lead

Update Lead

Delete Lead

Assign Lead

Merge Leads

Duplicate Detection

Status Changes

---

# Lead Forms Tests

Verify

Draft

Publish

Archive

Submission

Validation

Spam Protection

Lead Creation

---

# Search Tests

Verify

Search Results

Filtering

Permissions

Tenant Isolation

Ranking

Fallback Provider

---

# Activity Tests

Verify

Activity Creation

Timeline Order

Metadata

Immutability

---

# Notification Tests

Verify

Notification Creation

Read Status

Mark All Read

Unread Count

---

# Storage Tests

Verify

Upload

Delete

Signed URLs

Validation

Provider Errors

---

# Error Handling Tests

Every API should verify

400

401

403

404

409

422

500

Responses should follow the standard API envelope.

---

# Database Tests

Verify

Transactions

Indexes

Soft Deletes

Relationships

Cascade Behavior

Migration Safety

---

# API Contract Tests

Ensure

Response Shape

Error Shape

Pagination

Sorting

Filtering

remain consistent.

---

# UI Component Tests

Test

Rendering

Accessibility

User Interaction

State Changes

Avoid testing CSS implementation.

---

# Accessibility Tests

Verify

Keyboard Navigation

Focus Management

ARIA Labels

Semantic HTML

Screen Reader Support

Future

Automated accessibility checks.

---

# Performance Tests

Future

Measure

Dashboard Load

Search

Large Tables

Bulk Operations

Import Speed

---

# Test Data

Use

Factories

Builders

Fixtures

Avoid manually constructing large objects repeatedly.

Example

```ts
createLead()

createMember()

createOrganization()
```

---

# Test Isolation

Every test should

Create its own data

↓

Run

↓

Clean up

Tests must not depend on execution order.

---

# Mocking Guidelines

Mock

External APIs

Email

Storage

OAuth

Time

Do not mock

Business logic

Repositories (unless unit testing a service)

Validation

---

# Snapshot Testing

Use sparingly.

Good

Small DTOs

Email Templates

Avoid

Large React Components

Complex Pages

---

# Continuous Integration

Every pull request should run

Lint

↓

Type Check

↓

Unit Tests

↓

Integration Tests

↓

Build

↓

E2E (optional for feature branches)

No code should be merged with failing tests.

---

# Coverage Goals

Overall

```
80%
```

Critical Services

```
90%+
```

Coverage is a guide, not a target to game.

---

# Regression Testing

Every bug fix should include

A regression test

before or alongside the fix.

---

# Flaky Tests

Flaky tests should

Be fixed immediately

or

Be temporarily disabled with a linked issue.

Never ignore unstable tests.

---

# Code Review Expectations

Reviewers should verify

Meaningful assertions

Readable test names

Minimal mocking

Business-focused behavior

No duplicated setup

---

# Naming Convention

Examples

```
LeadService.test.ts

authorization.integration.test.ts

login.e2e.spec.ts
```

Test names

```
should_create_a_lead()

should_reject_invalid_email()
```

Describe expected behavior.

---

# Future Testing

Architecture supports

Contract Testing

Load Testing

Mutation Testing

Visual Regression

Security Testing

Chaos Testing

without changing the existing testing structure.

---

# Design Principles

Tests should provide confidence, not bureaucracy.

Developers should trust the test suite enough to refactor confidently.

Fast feedback is more valuable than exhaustive but slow testing.

---

# Success Criteria

The testing strategy should

Catch regressions early

Encourage refactoring

Document expected behavior

Support continuous delivery

Provide confidence in production releases

without becoming difficult to maintain.

---

End of Testing Strategy & Quality Assurance
