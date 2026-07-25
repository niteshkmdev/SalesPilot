# docs/13-leads.md

# Lead Management Module

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

The Lead module is the core business feature of SalesPilot.

Everything else in the application ultimately supports acquiring, organizing, assigning, tracking, and converting leads.

The Lead module should be fast, intuitive, scalable, and suitable for organizations ranging from a single salesperson to large teams.

---

# Goals

The Lead module should allow users to

✓ Capture leads

✓ Organize leads

✓ Assign ownership

✓ Track progress

✓ Record activity

✓ Store notes

✓ Upload attachments

✓ Search quickly

✓ Detect duplicates

✓ Maintain complete history

---

# Lead Lifecycle

Every lead progresses through a configurable pipeline.

```
Lead Created

↓

Assigned

↓

Worked

↓

Qualified

↓

Won

OR

Lost
```

Pipeline stages are organization configurable.

---

# Lead Status

Lead status belongs to

```
OrganizationLeadStatus
```

Each organization defines

Name

Color

Icon (future)

Display Order

Is Closed

Is Won

Default Status

Example

```
New

Contacted

Qualified

Proposal Sent

Negotiation

Won

Lost
```

No statuses are hardcoded in the application.

---

# Lead Ownership

Each lead contains

Assigned Manager

Assigned Member

Created By

Last Updated By

Assignment history is tracked through Activities.

---

# Lead Fields

Core Fields

```
Title

First Name

Last Name

Email

Phone

Company

Source

Status

Assigned Manager

Assigned Member
```

Optional Fields

```
Website

Job Title

Address

City

State

Country

Postal Code

Description
```

Organization-specific fields are stored separately as Custom Fields.

---

# Lead Source

Lead sources are organization configurable.

Example

```
Website

Referral

Walk-In

Email Campaign

Cold Call

Manual Entry
```

Lead sources should not be hardcoded.

---

# Custom Fields

Organizations may define additional fields.

Supported Types

Text

Textarea

Email

Phone

Number

Date (future)

Select (future)

Checkbox (future)

Values are stored as JSON.

---

# Lead Creation

Leads may be created from

Dashboard

Public Form

Manual Entry

Future

CSV Import

API

Workflow Automation

Regardless of origin,

every lead follows the same lifecycle.

---

# Lead Assignment

Assignment may occur

During Creation

After Creation

Bulk Assignment

Assignments generate Activities.

Example

```
Lead Assigned

Rahul

↓

Priya
```

---

# Lead Editing

Users may edit

Basic Information

Assignment

Status

Notes

Attachments

Custom Fields

Permission checks apply to every update.

---

# Lead Status Changes

Status changes create immutable Activities.

Example

```
Status Changed

New

↓

Qualified
```

Future

Status automation.

---

# Lead Detail Page

Contains

Overview

Notes

Activity

Attachments

Custom Fields

Related Information (future)

Layout

```
Header

↓

Overview

↓

Tabs

Notes

Activity

Attachments
```

---

# Lead List

Primary workspace.

Columns

Name

Company

Status

Assigned Member

Source

Updated

Created

Columns should be configurable in the future.

---

# Table Features

Supported

Search

Sorting

Filtering

Pagination

Bulk Selection

Column Resize (future)

Column Visibility (future)

Sticky Header

---

# Search

Global search supports

Name

Email

Phone

Company

Custom Fields

Primary

Atlas Search

Fallback

Regex

Search should be organization scoped.

---

# Filters

Supported

Status

Assigned Member

Assigned Manager

Lead Source

Date Created

Date Updated

Duplicate

Future

Saved Filters

---

# Sorting

Supported

Created Date

Updated Date

Name

Company

Status

Sorting should occur server-side.

---

# Bulk Actions

Supported

Assign

Delete

Change Status

Future

Export

Merge

Tag

Every bulk action respects permissions.

---

# Duplicate Detection

Duplicates are detected using

Email

Phone

A duplicate does NOT prevent lead creation.

Instead

```
isDuplicate = true
```

Users decide whether to merge.

---

# Merge Leads

Merge creates

New Lead

↓

Copies selected values

↓

Soft Deletes originals

↓

Creates Activity

No data should be lost.

---

# Merge Wizard

Displays

Field-by-field comparison.

Example

```
Email

Lead A

Lead B

↓

Choose Value
```

Every field requires an explicit decision.

---

# Lead Notes

Rich text supported.

Features

Formatting

Links

Lists

Code

Attachments

Notes remain editable by authorized users.

Future

Comments

Mentions

Threading

---

# Attachments

Supported

Images

PDF

Office Documents

Metadata stored in MongoDB.

Files stored in S3.

---

# Activity Timeline

Displays

Lead Created

Status Changed

Assignment Changed

Attachment Uploaded

Note Added

Lead Merged

Newest first.

Activities cannot be edited.

---

# Soft Delete

Deleting a lead

does not remove it.

Instead

```
deletedAt

deletedBy
```

Activities remain.

Attachments remain.

Future

Restore Lead.

---

# Lead Permissions

Members

Manage assigned leads.

Managers

Manage team leads.

Admins

Manage organization leads.

Owners

Full access.

Authorization always occurs server-side.

---

# Empty States

Lead List

```
No leads yet.

Create your first lead.
```

Search

```
No matching leads found.
```

Filters

```
No leads match the selected filters.
```

---

# Loading States

Use skeletons.

Never display

```
Loading...
```

The table should preserve layout during loading.

---

# Error States

Examples

Unable to load leads.

Unable to save changes.

Unable to merge leads.

Each should include

Retry

or

Return

action.

---

# Notifications

Lead events may generate notifications.

Examples

Lead Assigned

Lead Mentioned (future)

Lead Reassigned

Notifications are organization scoped.

---

# API Endpoints

```
GET /leads

GET /leads/{id}

POST /leads

PATCH /leads/{id}

DELETE /leads/{id}

PATCH /leads/{id}/assign

POST /leads/merge
```

Future

Bulk endpoints.

---

# Performance

Goals

Server-side pagination

Server-side filtering

Server-side sorting

Indexed search

Minimal client-side processing

The table should remain responsive with thousands of leads.

---

# Accessibility

Table supports

Keyboard Navigation

Focus Management

Screen Readers

Accessible Sort Controls

Accessible Filter Controls

Status indicators include text in addition to color.

---

# Future Features

Architecture supports

CSV Import

CSV Export

Lead Scoring

AI Summaries

Reminders

Tasks

Meetings

Tags

Timeline Filters

Workflow Automation

without redesigning the module.

---

# Success Criteria

The Lead module should allow users to

Capture leads quickly

Find any lead in seconds

Track every change

Assign work efficiently

Collaborate safely

Maintain a complete history

The Lead module should feel like the central workspace of SalesPilot rather than just another CRUD interface.

---

End of Lead Management Module
