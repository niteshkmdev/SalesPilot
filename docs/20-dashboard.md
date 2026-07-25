# docs/20-dashboard.md

# Dashboard Module (Implementation Guide)

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

The Dashboard is the application's primary entry point after authentication.

Unlike other modules, the Dashboard owns very little business logic.

Its responsibility is to aggregate information from multiple modules and present it efficiently.

The Dashboard should never become a "God Module."

---

# Design Principles

The Dashboard

✓ Aggregates data

✓ Does not own business logic

✓ Loads independently

✓ Supports role-based widgets

✓ Remains fast

✓ Scales as new widgets are added

---

# Architecture

```
Dashboard Page

        │

        ▼

Dashboard Service

        │

        ├──────────────┐
        │              │
        ▼              ▼

Lead Service     Activity Service

        │              │

        ▼              ▼

Notification     Analytics

        │

        ▼

Response DTO
```

The Dashboard Service orchestrates multiple modules.

Feature modules never depend on each other.

---

# Responsibilities

Dashboard Service

- Aggregate widget data
- Apply permissions
- Normalize responses
- Handle widget configuration
- Provide dashboard-specific DTOs

Dashboard Service does **not**

- Update leads
- Create activities
- Send notifications
- Execute business workflows

---

# Widget Architecture

Every dashboard section is implemented as an independent widget.

```
Dashboard

├── Metrics Widget
├── Pipeline Widget
├── Assigned Leads Widget
├── Activity Widget
├── Notifications Widget
├── Quick Actions Widget
└── Future Widgets
```

Widgets should never depend on each other.

---

# Widget Contract

Every widget exposes

```ts
interface DashboardWidget<T> {
    id: string
    title: string
    load(): Promise<T>
}
```

Widgets return only the data they own.

---

# Dashboard Layout

```
+----------------------------------------------------+

 Metrics

------------------------------------------------------

 Pipeline

------------------------------------------------------

 Assigned Leads

------------------------------------------------------

 Activity | Notifications

------------------------------------------------------

 Quick Actions

+----------------------------------------------------+
```

The layout should be configurable without changing widget implementations.

---

# Widget Independence

Each widget

- Has its own endpoint
- Has its own loading state
- Has its own error state
- Can refresh independently

Example

```
GET /dashboard/metrics

GET /dashboard/activity

GET /dashboard/pipeline

GET /dashboard/notifications
```

---

# Aggregated Endpoint

The Dashboard also exposes

```
GET /dashboard
```

Returns

```json
{
    "metrics": {},
    "pipeline": {},
    "activity": [],
    "notifications": [],
    "assignedLeads": []
}
```

Useful for initial page load.

---

# Request Flow

```
Dashboard Page

↓

Dashboard Service

↓

Lead Service

↓

Activity Service

↓

Notification Service

↓

Response
```

Dashboard never queries the database directly.

---

# DTO Layer

Never expose database models.

Example

```
Lead

↓

LeadDashboardDTO
```

Dashboard DTOs contain only required fields.

---

# Metrics Widget

Displays

- Total Leads
- New Leads
- Won Leads
- Lost Leads
- Conversion Rate

All calculations occur server-side.

---

# Pipeline Widget

Displays

Pipeline stages

↓

Lead counts

↓

Percentages

Uses OrganizationLeadStatus.

No hardcoded statuses.

---

# Assigned Leads Widget

Displays

- Assigned to Me
- Recently Updated
- High Priority (future)

Supports pagination.

---

# Activity Widget

Displays

Recent organization activities.

Maximum

```
10
```

records.

---

# Notifications Widget

Displays

Unread notifications.

Supports

Mark Read

Refresh

Navigation

---

# Quick Actions Widget

Examples

```
Create Lead

Invite Member

Create Form

Open Settings
```

Visibility depends on permissions.

---

# Role Awareness

Dashboard changes based on role.

Member

- Assigned Leads
- Notifications
- Activity

Manager

- Team Metrics
- Team Leads

Admin

- Organization Metrics
- Members

Owner

- Everything

Widget visibility is permission-driven.

---

# Personalization

Future

Users may

- Hide widgets
- Reorder widgets
- Resize widgets

Widget configuration stored per member.

---

# Loading Strategy

Dashboard never blocks on slow widgets.

Instead

```
Page

↓

Widget A

Widget B

Widget C

Independent Loading
```

Users see content immediately.

---

# Skeletons

Every widget provides its own skeleton.

Avoid

```
Loading Dashboard...
```

Only individual widgets display loading placeholders.

---

# Error Handling

Widget failures remain isolated.

Example

```
Metrics ✓

Pipeline ✓

Activity ✗

Notifications ✓
```

One failed widget must never break the dashboard.

---

# Refresh Strategy

Widgets refresh independently.

Example

```
Metrics

↓

Every 60 Seconds

Notifications

↓

Manual + Focus Refresh

Activity

↓

30 Seconds
```

Refresh intervals should be configurable.

---

# TanStack Query

Each widget owns its own query.

Example

```ts
useDashboardMetrics()

useDashboardPipeline()

useDashboardActivity()
```

Never create one giant dashboard query for ongoing updates.

---

# Query Keys

Recommended

```text
["dashboard", "metrics"]

["dashboard", "pipeline"]

["dashboard", "activity"]

["dashboard", "notifications"]
```

Consistent query keys simplify cache invalidation.

---

# Cache Strategy

Suggested stale times

| Widget | Stale Time |
|---------|-----------:|
| Metrics | 60 seconds |
| Pipeline | 60 seconds |
| Activity | 30 seconds |
| Notifications | 15 seconds |
| Assigned Leads | 30 seconds |

---

# Server Components

Dashboard page

↓

Server Component

Widgets

↓

Server or Client depending on interaction.

Prefer Server Components whenever possible.

---

# Client Components

Only interactive widgets become Client Components.

Examples

Filters

Dropdowns

Charts

Mark Read

Drag and Drop (future)

---

# Charts

Version 1

Recharts

Charts receive precomputed data.

Never perform aggregation in React.

---

# API Response

Example

```json
{
    "success": true,
    "data": {
        "metrics": {},
        "pipeline": {},
        "assignedLeads": [],
        "activity": [],
        "notifications": []
    }
}
```

---

# Performance Goals

Dashboard should

- Render quickly
- Minimize network requests
- Minimize client computation
- Support hundreds of thousands of leads

Business logic always remains server-side.

---

# Security

Every widget performs authorization independently.

Example

```
Pipeline Widget

↓

Permission Check

↓

Load Data
```

Never assume dashboard-level authorization is sufficient.

---

# Accessibility

Widgets support

Keyboard Navigation

Screen Readers

Semantic Headings

Accessible Charts

Visible Focus

---

# Mobile Layout

Desktop

```
2–3 Column Grid
```

Tablet

```
2 Columns
```

Mobile

```
Single Column
```

Widgets stack vertically.

---

# Future Features

Architecture supports

AI Insights

Goals

Tasks

Calendar

Reminders

Forecasting

Sales Leaderboard

Saved Dashboard Layouts

without redesigning the dashboard architecture.

---

# Design Principles

The Dashboard is a composition layer.

Business logic belongs to feature modules.

Widgets remain independent.

Aggregation belongs to the Dashboard Service.

The Dashboard should remain simple regardless of application growth.

---

# Success Criteria

The Dashboard should

Provide immediate value after login

Load quickly

Scale to many widgets

Remain modular

Be easy to extend

without becoming tightly coupled to business modules.

---

End of Dashboard Module
