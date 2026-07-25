# docs/17-search.md

# Search Module

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

The Search module provides fast, relevant, and scalable search across SalesPilot.

Search should allow users to find information in seconds regardless of how much data exists.

Business modules should never depend on a specific search engine.

---

# Design Goals

The Search module should be

✓ Fast

✓ Accurate

✓ Extensible

✓ Organization Scoped

✓ Search Engine Agnostic

---

# Search Philosophy

Search is an infrastructure capability.

Business modules ask for results.

They should never know

- Atlas Search
- Regex
- Elasticsearch
- Meilisearch

Implementation details remain hidden.

---

# Architecture

```
Lead Module
        │
        ▼
Search Service
        │
        ├── Atlas Search
        ├── Regex Fallback
        └── Future Search Providers
```

Only the Search Service communicates with search providers.

---

# Search Service

Responsibilities

✓ Execute searches

✓ Select provider

✓ Normalize results

✓ Handle fallback

✓ Rank relevance

Business logic remains outside the service.

---

# Search Providers

Version 1

Primary

```
MongoDB Atlas Search
```

Fallback

```
Regex Search
```

Future

```
Elasticsearch

Meilisearch

OpenSearch

Typesense
```

Replacing providers should not require changing feature modules.

---

# Search Scope

Version 1 supports

Leads

Members (Future)

Forms (Future)

Activities (Future)

Notifications (Future)

---

# Global Search

Global Search appears in the application header.

Shortcut

```
/
```

Future

Command Palette

```
⌘K

Ctrl+K
```

---

# Search Flow

```
User Input

↓

Debounce

↓

Search Service

↓

Provider

↓

Results

↓

UI
```

---

# Debouncing

Search requests should debounce

```
300ms
```

Avoid sending requests on every keystroke.

---

# Minimum Query Length

Minimum

```
2 Characters
```

Single-character searches are ignored.

---

# Search Fields

Lead search includes

First Name

Last Name

Email

Phone

Company

Custom Fields

Future

Notes

Attachments

Tags

---

# Search Behavior

Search should be

Case Insensitive

Accent Insensitive

Whitespace Tolerant

---

# Partial Matching

Supported

Example

Searching

```
Mic
```

Should match

```
Michael

Microsoft

Micro Labs
```

---

# Exact Matching

Exact matches rank higher.

Example

Searching

```
Rahul Sharma
```

Ranks above

```
Rahul Kumar Sharma
```

---

# Ranking

Preferred ranking

1.

Exact Match

2.

Prefix Match

3.

Contains Match

4.

Custom Field Match

Atlas Search handles ranking.

Fallback provider performs best-effort ordering.

---

# Search Result

Each result contains

```
Type

ID

Title

Subtitle

Matched Field

Navigation URL
```

Example

```
Lead

Rahul Sharma

Acme Pvt Ltd

rahul@example.com
```

---

# Organization Isolation

Every search query is scoped.

```
Organization

↓

Search

↓

Results
```

Search must never return data from another organization.

---

# Permissions

Search results respect RBAC.

Example

Member

↓

Search

↓

Only Assigned Leads

Manager

↓

Assigned Team Leads

Admin

↓

All Organization Leads

---

# Search API

Global Search

```
GET /search?q=query
```

Future

Module Search

```
GET /search/leads

GET /search/forms

GET /search/members
```

---

# Lead Search Endpoint

Example

```
GET /search/leads?q=rahul
```

Supports

Pagination

Sorting

Filtering

---

# Empty Query

Empty query

↓

No request

Display

```
Start typing to search...
```

---

# No Results

Display

```
No matching results found.
```

Include

Search Tips

Example

Try another keyword.

---

# Search Suggestions

Version 1

Not Supported

Future

Recent Searches

Popular Searches

Suggested Contacts

---

# Highlighting

Future

Matched text

```
Rahul Sharma
```

becomes

```
**Rahul** Sharma
```

Atlas Search supports highlighting.

---

# Search Filters

Version 1

Status

Assigned Member

Source

Future

Tags

Date Range

Custom Fields

Owner

---

# Search Pagination

Default

```
20 Results
```

Supports

Page

Limit

---

# Search Performance

Goals

Response

```
<300ms
```

Search should feel instantaneous.

---

# Caching

Frequently repeated queries may be cached.

Version 1

TanStack Query

Future

Redis

---

# Recent Searches

Future

Store per user

Maximum

```
10
```

Recent searches remain private.

---

# Search History

Out of scope.

Future

History

Pinned Searches

Saved Searches

---

# Saved Filters

Future

Users may save

```
Qualified Leads

↓

Assigned to Me

↓

Created This Month
```

---

# Command Palette

Future

```
Ctrl + K

↓

Search

↓

Navigate

↓

Quick Actions
```

Example

```
Create Lead

Invite Member

Open Settings

Search Rahul
```

---

# Accessibility

Search supports

Keyboard Navigation

Arrow Keys

Enter

Escape

Screen Readers

Visible Focus

---

# Mobile Experience

Search opens

Full-screen overlay.

Large input.

Scrollable results.

---

# Error Handling

Search failures display

```
Unable to search.

Please try again.
```

Search should fail gracefully.

---

# Security

Never expose

Deleted Records

Unauthorized Records

Other Organizations

Internal IDs

Search results always respect authorization.

---

# API Response

Example

```json
{
  "success": true,
  "data": [
    {
      "type": "lead",
      "id": "...",
      "title": "Rahul Sharma",
      "subtitle": "Acme Pvt Ltd",
      "url": "/dashboard/leads/123"
    }
  ]
}
```

---

# Future Features

Architecture supports

Semantic Search

AI Search

Natural Language Queries

Search Analytics

Typo Correction

Synonyms

Saved Searches

Pinned Results

Search Suggestions

without changing the Search Service interface.

---

# Success Criteria

Users should be able to

Find any lead

Locate records quickly

Search naturally

Navigate directly from results

without needing to browse through tables.

Search should remain consistently fast regardless of the underlying search provider.

---

End of Search Module
