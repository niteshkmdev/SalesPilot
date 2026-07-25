# docs/12-dashboard.md

# Dashboard Specification

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

The dashboard is the primary workspace of SalesPilot.

It provides users with a high-level overview of their work, highlights important activity, and serves as the entry point to all major workflows.

The dashboard should answer three questions immediately:

- What needs my attention?
- How is my pipeline performing?
- What should I do next?

---

# Design Principles

The dashboard should be

✓ Fast

✓ Minimal

✓ Actionable

✓ Personalized

✓ Responsive

It should prioritize useful information over decorative elements.

---

# Personalization

The dashboard adapts based on

- User Role
- Organization
- Assigned Leads
- Recent Activity

No two users are guaranteed to see identical dashboards.

---

# Dashboard Layout

Desktop

```
----------------------------------------------------

Top Navigation

----------------------------------------------------

Page Header

Quick Actions

----------------------------------------------------

Metrics

----------------------------------------------------

Charts

Recent Activity

----------------------------------------------------

Assigned Leads

Notifications

----------------------------------------------------
```

Mobile

```
Header

↓

Metrics

↓

Quick Actions

↓

Charts

↓

Recent Activity

↓

Assigned Leads

↓

Notifications
```

---

# Data Loading Strategy

Dashboard widgets load independently.

Each widget has its own API endpoint.

Example

```
GET /dashboard/metrics

GET /dashboard/pipeline

GET /dashboard/activity

GET /dashboard/notifications
```

Widgets should render as soon as data becomes available.

---

# Refresh Strategy

Dashboard data refreshes

- On initial load
- On browser refresh
- After relevant mutations
- Manual refresh

Future

Background polling

Real-time updates

---

# Dashboard Header

Contains

Title

Organization Name

Current Date Range

Quick Actions

Example

```
Dashboard

This Month

+ New Lead
```

---

# Date Range

Default

```
This Month
```

Supported

Today

Last 7 Days

Last 30 Days

This Month

Last Month

Custom Range

Changing the range updates all widgets.

---

# Quick Actions

Primary actions

Create Lead

Invite Member

Create Lead Form

These actions open dialogs.

Navigation should remain uninterrupted.

---

# Metrics Row

Displayed as cards.

Default metrics

Total Leads

Qualified Leads

Won Leads

Conversion Rate

Additional metrics may be added later.

---

# Metric Card

Contains

Title

Primary Value

Comparison (future)

Optional Trend

Example

```
Total Leads

245
```

Cards should remain compact.

---

# Conversion Rate

Formula

```
Won Leads

/

Total Leads
```

Displayed as a percentage.

---

# Pipeline Widget

Visualization

Horizontal bar chart

or

Stacked chart

Displays

Lead count per status.

Statuses

New

Contacted

Qualified

Proposal Sent

Negotiation

Won

Lost

---

# Lead Source Widget

Displays

Lead count by source.

Examples

Website

Referral

Manual

Email

Campaign

Visualization

Pie chart

or

Horizontal bars

---

# Recent Activity

Displays

Latest activities

Examples

Lead Created

Lead Assigned

Lead Updated

Invitation Accepted

Role Changed

Newest first.

---

# Activity Card

Contains

Icon

Title

Description

Relative Time

Example

```
Lead assigned to Rahul

5 minutes ago
```

---

# Assigned Leads

Displays

Leads assigned to the current member.

Columns

Name

Company

Status

Last Updated

Priority (future)

Clicking a row opens the lead.

---

# Notifications Widget

Displays

Unread notifications first.

Shows

Title

Description

Time

Read Status

CTA

```
View All
```

---

# Empty States

Every widget defines its own empty state.

Example

Pipeline

```
No leads yet.

Create your first lead to start tracking your pipeline.
```

---

# Loading States

Every widget uses skeleton loading.

Never display

```
Loading...
```

Skeletons should resemble final layout.

---

# Error States

Widget failures should not break the page.

Display

Icon

Message

Retry Button

Example

```
Unable to load pipeline.

Retry
```

---

# Role-Based Dashboard

## Owner

Sees

Organization metrics

Member statistics

Pipeline

Notifications

Recent Activity

Quick Actions

---

## Admin

Same as Owner

except owner-only administrative actions.

---

## Manager

Sees

Assigned Team Metrics

Assigned Leads

Pipeline

Activity

Notifications

Does not see organization-wide administration widgets.

---

## Member

Sees

Own Leads

Own Activity

Own Notifications

Personal Metrics

No organization management information.

---

# Search Shortcut

Dashboard header includes

Global Search

Future enhancement

Quick Command Palette.

---

# Keyboard Shortcuts

Future

```
N

↓

Create Lead
```

```
/

↓

Search
```

```
G D

↓

Dashboard
```

Out of scope for v1.

---

# Recent Leads

Optional widget.

Shows

Recently viewed

or

Recently updated leads.

Maximum

10 items.

---

# Upcoming Features

Reserved area.

Future

Tasks

Meetings

Reminders

Calendar

Not implemented in v1.

---

# Widget Independence

Each widget

Own API

Own loading state

Own error state

Own cache

Widgets should never depend on one another.

---

# Caching

TanStack Query caches each widget separately.

Example

```
dashboard-metrics

dashboard-pipeline

dashboard-activity

dashboard-notifications
```

Mutations invalidate only affected widgets.

---

# Dashboard Performance

Goals

First Contentful Paint

Fast

Largest Contentful Paint

Fast

Time to Interactive

Minimal JavaScript

Server Components should render as much as possible.

---

# Accessibility

Widgets must support

Keyboard Navigation

Semantic Headings

Screen Readers

High Contrast

Visible Focus

Charts should include accessible summaries.

---

# Responsive Behavior

Desktop

Multiple columns.

Tablet

Two-column layout where possible.

Mobile

Single column.

Charts resize automatically.

Tables become horizontally scrollable if necessary.

---

# Future Dashboard Features

Architecture supports

Custom Widget Order

Saved Layouts

Favorite Widgets

Widget Visibility

Real-Time Metrics

Pinned Reports

without redesigning the dashboard.

---

# Success Criteria

A user should understand the current state of their work within five seconds of opening the dashboard.

The dashboard should encourage action rather than simply display data.

Every widget should answer a meaningful business question and provide a clear next step where appropriate.

---

End of Dashboard Specification
