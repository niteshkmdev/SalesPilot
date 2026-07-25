# docs/03-folder-structure.md

# Repository Structure

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines the entire repository layout.

Every file added to the project must have an obvious and predictable location.

A developer should never need to wonder:

> "Where should this file go?"

Consistency is more important than personal preference.

---

# Design Philosophy

The repository follows four principles.

1. Business features own themselves.

2. Infrastructure is isolated.

3. Shared code contains only reusable utilities.

4. Route handlers remain thin.

---

# High Level Structure

```
salespilot/

├── docs/
│
├── prisma/
│
├── public/
│
├── src/
│
├── tests/
│
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.js
├── prettier.config.js
└── README.md
```

---

# Source Directory

```
src/

├── app/
├── modules/
├── shared/
├── server/
├── styles/
└── types/
```

Every directory has a clearly defined responsibility.

---

# app/

Contains App Router routes only.

Never place business logic here.

```
app/

├── (marketing)/
│
├── (auth)/
│
├── (dashboard)/
│
├── api/
│
├── favicon.ico
│
├── globals.css
│
├── layout.tsx
│
└── not-found.tsx
```

---

# Route Groups

Marketing

```
(marketing)

Landing

Pricing

FAQ

Privacy

Terms
```

Authentication

```
(auth)

Login

Signup

Forgot Password

Reset Password

Invitation
```

Dashboard

```
(dashboard)

Dashboard

Leads

Forms

Settings

Notifications

Members
```

---

# API Structure

```
app/

api/

v1/

auth/

users/

organizations/

members/

roles/

permissions/

dashboard/

leads/

lead-forms/

notifications/

uploads/

settings/
```

Each folder contains only

```
route.ts
```

No helper files.

No validation.

No repositories.

No business logic.

---

# Example Route

```
app/

api/

v1/

leads/

route.ts
```

Example

```ts
export async function POST(request: Request) {
    return createLeadRoute(request);
}
```

Nothing else.

---

# Modules

Every business feature owns itself.

```
modules/

auth/

dashboard/

organizations/

members/

roles/

permissions/

leads/

lead-forms/

notifications/

branding/

settings/

search/

profile/
```

No feature should depend on another feature's internal implementation.

Communication should happen through exported APIs.

---

# Example Module

```
modules/

leads/

├── actions/
├── components/
├── constants/
├── hooks/
├── permissions/
├── repository/
├── routes/
├── schemas/
├── services/
├── types/
├── utils/
├── index.ts
```

---

# actions/

Actions orchestrate business logic.

Examples

```
createLead.ts

updateLead.ts

deleteLead.ts

assignLead.ts

mergeLead.ts

restoreLead.ts
```

Rules

✓ One action per file

✓ Single responsibility

✓ Typed input

✓ Typed output

✓ No UI

---

# repository/

Repositories own persistence.

```
lead.repository.ts
```

Responsibilities

Read

Create

Update

Delete

Query

Nothing else.

Repositories never

- validate
- authorize
- notify
- log activities

---

# services/

Services contain reusable feature logic.

Examples

```
leadSearch.service.ts

duplicateDetection.service.ts

leadRouting.service.ts
```

A service may be used by multiple actions.

---

# schemas/

Every request schema belongs here.

Examples

```
createLead.schema.ts

updateLead.schema.ts

mergeLead.schema.ts
```

Use Zod only.

---

# hooks/

Contains React hooks.

Examples

```
useLeadFilters.ts

useLeadTable.ts

useLeadSelection.ts
```

Hooks never perform direct database work.

---

# components/

Only UI.

Examples

```
LeadTable.tsx

LeadCard.tsx

LeadHeader.tsx

LeadFilters.tsx

LeadStatusBadge.tsx
```

Business logic belongs elsewhere.

---

# permissions/

Permission helpers.

Examples

```
canEditLead.ts

canDeleteLead.ts

canAssignLead.ts
```

Never hardcode permission names inside components.

---

# constants/

Examples

```
lead-status.ts

lead-source.ts

lead-priority.ts
```

No magic strings.

---

# utils/

Feature specific utilities.

Examples

```
formatLeadName.ts

buildLeadTitle.ts
```

Utilities should remain pure.

---

# types/

Feature types.

```
Lead.ts

LeadFilters.ts

LeadSummary.ts
```

Avoid duplicated interfaces.

---

# routes/

Optional.

Contains route helpers.

Example

```
createLeadRoute.ts

deleteLeadRoute.ts
```

Allows route.ts to remain tiny.

---

# Shared Directory

Shared contains reusable code only.

```
shared/

components/

hooks/

lib/

constants/

utils/

schemas/

types/
```

If code is only useful to Leads,

it does NOT belong here.

---

# shared/components

Reusable UI.

Examples

```
DataTable

PageHeader

StatCard

LoadingSpinner

SearchInput

ConfirmDialog

EmptyState

ErrorState
```

Never include Lead-specific UI.

---

# shared/hooks

Reusable hooks.

```
useDebounce

useMediaQuery

useLocalStorage

useDisclosure
```

---

# shared/lib

Framework integrations.

Examples

```
cn.ts

fetcher.ts

date.ts

env.ts
```

---

# shared/constants

Application wide constants.

```
Routes

Cookies

Storage Keys

Query Keys
```

---

# shared/utils

Pure utilities.

Examples

```
formatDate

formatPhone

formatCurrency

slugify
```

---

# Server Directory

Infrastructure only.

```
server/

auth/

db/

storage/

email/

search/

permissions/

logger/
```

---

# server/db

Contains

```
prisma.ts
```

Only one Prisma client.

Never instantiate Prisma twice.

---

# server/auth

Contains Better Auth configuration.

```
auth.ts

providers.ts

session.ts
```

---

# server/storage

S3 abstraction.

```
upload.ts

delete.ts

signedUrl.ts
```

Modules never directly interact with AWS SDK.

---

# server/search

Search abstraction.

```
atlasSearch.ts

regexSearch.ts
```

Allows future provider replacement.

---

# server/email

React Email.

```
templates/

sendEmail.ts
```

Even though emails are limited today,

architecture supports expansion.

---

# server/logger

Currently

```
console
```

Future

```
Pino
```

No module should call console directly.

Always import logger.

---

# Prisma

```
prisma/

schema.prisma

seed.ts

migrations/
```

Seed creates

Owner

Organization

Roles

Permissions

Demo Leads

Demo Forms

---

# Public

```
public/

images/

icons/

logo/

illustrations/
```

Do not place uploaded files here.

Uploads belong to S3.

---

# Styles

```
styles/

tokens.css
```

Global design tokens only.

No component CSS.

Tailwind handles styling.

---

# Tests

```
tests/

unit/

integration/

e2e/
```

Never mix tests into production folders.

---

# Import Aliases

Always use aliases.

Good

```ts
import { Button } from "@/shared/components/button";
```

Bad

```ts
../../../shared/components/button
```

---

# Allowed Imports

Modules

↓

Shared

↓

Server

Allowed

```
Lead Component

↓

Lead Action

↓

Lead Repository

↓

Prisma
```

Forbidden

```
Lead Component

↓

Prisma
```

Forbidden

```
Route

↓

Prisma
```

Forbidden

```
Shared

↓

Lead Module
```

Shared should never know business features.

---

# Barrel Exports

Every module should expose

```
index.ts
```

Example

```
modules/

leads/

index.ts
```

Exports

Components

Actions

Hooks

Types

Avoid importing deep paths across modules.

---

# File Naming

Components

```
PascalCase.tsx
```

Hooks

```
camelCase.ts
```

Repositories

```
*.repository.ts
```

Schemas

```
*.schema.ts
```

Actions

```
verbNoun.ts
```

Examples

```
createLead.ts

mergeLead.ts

assignLead.ts
```

Types

```
PascalCase.ts
```

---

# Maximum File Size

Preferred

Under 200 lines

Acceptable

300 lines

Avoid

500+ lines

If a file exceeds 300 lines,

consider splitting it.

---

# Module Independence

Each module should be removable with minimal impact.

Business logic should never be scattered throughout the application.

A new developer should be able to open

```
modules/leads
```

and understand nearly everything about Lead Management.

---

# Repository Philosophy

The folder structure should communicate architecture.

A reviewer should understand the project simply by browsing the repository tree.

Every file should have one obvious home.

If a file could reasonably belong in two places,

the architecture should be adjusted until only one location makes sense.

---

End of Folder Structure Document
