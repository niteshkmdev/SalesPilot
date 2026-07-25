# docs/19-activity.md

# Activity Module

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

The Activity module provides a permanent, immutable audit trail of significant business events across SalesPilot.

Activities answer the question:

> **"What happened?"**

Unlike notifications, activities are historical records and are never intended to alert users.

Every important action performed in the system should leave an activity record.

---

# Design Goals

The Activity module should be

✓ Immutable

✓ Complete

✓ Searchable

✓ Chronological

✓ Reliable

✓ Extensible

---

# Activity Philosophy

Activities are generated from domain events.

Business logic never creates activity records directly.

Instead

```
Business Action

↓

Domain Event

↓

Activity Handler

↓

Activity Record
```

This keeps business services focused solely on business rules.

---

# Responsibilities

The Activity Service is responsible for

✓ Recording activities

✓ Formatting activity entries

✓ Persisting audit history

✓ Providing activity timelines

✓ Filtering activity records

Business modules never insert activities directly.

---

# Activity Lifecycle

```
Business Action

↓

Domain Event

↓

Activity Created

↓

Timeline

↓

Permanent Record
```

Activities are never updated or deleted.

---

# Immutability

Once created

An activity

- Cannot be edited
- Cannot be deleted
- Cannot be reordered

Corrections create new activities.

Example

```
Lead Assigned

↓

Lead Reassigned
```

Both remain visible.

---

# Activity Model

Each activity contains

```
ID

Organization ID

Actor

Entity Type

Entity ID

Action

Metadata

Created At
```

Metadata is stored as JSON.

---

# Actor

Represents who performed the action.

Examples

```
User

System

Automation (Future)

API Key (Future)
```

---

# Entity Types

Version 1

```
Lead

Lead Form

Organization

Member

Role

Custom Field

Invitation
```

Future

```
Task

Reminder

Import

Export

Workflow
```

---

# Actions

Examples

```
Created

Updated

Deleted

Assigned

Reassigned

Published

Archived

Accepted

Rejected
```

Actions should use consistent naming across the application.

---

# Metadata

Stores contextual information.

Example

```json
{
    "oldStatus": "New",
    "newStatus": "Qualified"
}
```

Metadata structure depends on the action.

---

# Timeline

Every entity may expose an activity timeline.

Example

```
Lead

↓

Timeline

↓

Activities
```

Newest activities appear first.

---

# Activity Feed

Dashboard displays

Recent Activities

Across the organization.

Example

```
Rahul assigned Lead "Acme"

2 minutes ago
```

---

# Lead Timeline

Examples

```
Lead Created

Status Changed

Assigned

Reassigned

Attachment Uploaded

Note Added

Merged
```

Chronological history should be complete.

---

# Organization Timeline

Examples

```
Member Invited

Role Created

Branding Updated

Lead Form Published
```

---

# Member Timeline

Future

Examples

```
Joined Organization

Role Changed

Invitation Accepted
```

---

# Events That Generate Activities

Version 1

Lead Created

Lead Updated

Lead Assigned

Lead Reassigned

Status Changed

Lead Deleted

Lead Merged

Attachment Uploaded

Attachment Deleted

Lead Form Created

Lead Form Published

Lead Form Archived

Invitation Sent

Invitation Accepted

Role Updated

Custom Field Created

Custom Field Updated

Organization Updated

---

# Events That Do NOT Generate Activities

Examples

User Login

Dashboard Viewed

Search Performed

Filter Changed

Pagination

Notification Read

Activities should capture meaningful business history only.

---

# Activity Formatting

Every activity should be human-readable.

Examples

```
Rahul assigned the lead to Priya.

Status changed from New to Qualified.

Attachment "Proposal.pdf" uploaded.

Organization branding updated.
```

Avoid technical wording.

---

# Relative Time

Display

```
Just now

5 minutes ago

Yesterday

3 days ago
```

Exact timestamps appear in detail views or tooltips.

---

# Filtering

Version 1

Entity

Action

Actor

Date Range

Future

Category

Tags

Severity

---

# Search

Future

Search

Actor

Action

Entity

Metadata

---

# Pagination

Default

```
20 Activities
```

Supports

Page

Limit

Newest first.

---

# Permissions

Members

View activities related to accessible leads.

Managers

View team activities.

Admins

View organization activities.

Owners

Full visibility.

Authorization applies before activity retrieval.

---

# Activity Service

Example Interface

```ts
interface ActivityService {
    record()
    list()
    getTimeline()
}
```

Business modules depend only on this interface.

---

# API Endpoints

```
GET /activities

GET /activities/entity/{id}
```

Future

```
GET /activities/member/{id}

GET /activities/export
```

---

# Activity Feed Widget

Dashboard widget displays

Latest organization activities.

Maximum

```
10
```

Recent entries.

---

# Empty State

```
No activity yet.

Business events will appear here.
```

---

# Loading State

Skeleton list.

Do not block the page while loading activity history.

---

# Error State

Example

```
Unable to load activity.

Retry
```

---

# Performance

Goals

Indexed queries

Efficient pagination

Minimal joins

Fast timeline loading

Activities should remain performant even with millions of records.

---

# Retention

Version 1

Activities are retained indefinitely.

Future

Retention Policies

Archive Storage

Compliance Export

---

# Export

Future

CSV

PDF

JSON

Audit Export

Exports respect permissions.

---

# Accessibility

Support

Keyboard Navigation

Screen Readers

Visible Focus

Accessible timestamps

Semantic lists

---

# Mobile Experience

Timeline becomes stacked cards.

Infinite scrolling may be added later.

Touch-friendly spacing.

---

# Security

Activity records

Cannot be modified

Cannot be forged

Cannot be removed through normal application workflows.

All activity creation occurs on the server.

---

# Relationship with Notifications

Activities answer

```
What happened?
```

Notifications answer

```
Who should know?
```

Many events create both.

Neither depends on the other.

---

# Future Features

Architecture supports

AI Activity Summaries

Compliance Reports

Audit Exports

Workflow Visualization

Timeline Filters

Pinned Activities

Cross-Entity Timeline

without redesigning the Activity Service.

---

# Design Principles

Activities are the source of truth for historical business events.

Every significant action should be traceable.

Activity history should be trusted, complete, and easy to understand.

---

# Success Criteria

Users should be able to

Understand what happened

See who performed an action

Track changes over time

Review entity history

Audit important events

without relying on notifications or manual logs.

The Activity module should provide a reliable audit trail that scales with the application's growth.

---

End of Activity Module
