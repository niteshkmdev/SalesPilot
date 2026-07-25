# docs/11-onboarding.md

# User Onboarding & First-Time Experience

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines the onboarding experience for new users joining SalesPilot.

The goal is to minimize time-to-value while keeping onboarding simple.

A new user should be productive within five minutes.

---

# Onboarding Principles

The onboarding experience should be

✓ Short

✓ Optional

✓ Contextual

✓ Non-blocking

✓ Easy to resume

Users should never feel trapped in a long setup process.

---

# User Types

There are two onboarding journeys.

1. Organization Owner

Creates a new organization.

2. Invited Member

Joins an existing organization.

These experiences differ significantly.

---

# Owner Journey

```
Landing Page

↓

Sign Up

↓

Email Verification
(if required)

↓

Organization Created

↓

Setup Wizard

↓

Dashboard
```

---

# Member Journey

```
Invitation Email

↓

Invitation Link

↓

Password OR Google

↓

Membership Created

↓

Welcome Screen

↓

Dashboard
```

Members do not see the Setup Wizard.

---

# Setup Wizard

Displayed only once.

Only for Organization Owners.

Progress is saved automatically.

Users may leave and continue later.

---

# Setup Flow

```
Welcome

↓

Invite Team

↓

Create Lead Form

↓

Create First Lead

↓

Finish

↓

Dashboard
```

Each step is optional.

Users may skip at any point.

---

# Step 1

Welcome

Purpose

Introduce SalesPilot.

Display

Organization Name

Owner Name

Next Step

Button

```
Let's Get Started
```

---

# Step 2

Invite Team

Purpose

Encourage collaboration.

User enters

Name

Email

Role

May invite multiple users.

Actions

Skip

Invite

Continue

Invitations send immediately.

---

# Step 3

Create First Lead Form

Purpose

Enable public lead capture.

Fields

Name

Slug

Description

Assigned Manager

Defaults

Status

Published

Preview available immediately.

Skip allowed.

---

# Step 4

Create First Lead

Purpose

Prevent an empty CRM.

Minimal Fields

First Name

Last Name

Email

Phone

Status

Source

Assigned Member

Button

```
Create Lead
```

Skip allowed.

---

# Step 5

Finish

Display

Success message.

Summary

Team Invited

Lead Form Created

Lead Created

CTA

```
Go to Dashboard
```

---

# Demo Data

If no lead exists,

offer

```
Load Demo Workspace
```

Creates

Example Leads

Activities

Notifications

Dashboard Metrics

Demo data can later be removed.

---

# Skip Behavior

Every onboarding step can be skipped.

Skipping never blocks access.

Users may revisit setup later.

---

# Onboarding State

Store onboarding progress per organization.

Example

```
setupCompleted

currentStep

completedSteps
```

This allows

Resume

Future onboarding

Progress tracking

---

# First Dashboard Experience

After onboarding,

the dashboard adapts based on organization state.

---

# Empty Dashboard

If no leads exist

Display

Illustration

Title

Description

Primary CTA

```
Create Your First Lead
```

Secondary CTA

```
Create Lead Form
```

---

# Partial Setup

If leads exist

but

no forms

Display

Suggestion Card

```
Create a Lead Form to collect leads automatically.
```

Dismissible.

---

# No Team Members

Display

```
Invite your team to start collaborating.
```

Button

Invite Members

Dismissible.

---

# Contextual Tips

Display only when relevant.

Examples

First Lead

↓

Assign it to a team member.

No Branding

↓

Customize your branding.

No Notifications

↓

You're all caught up.

Tips disappear after completion.

---

# Progress Tracking

Display

Setup Progress

Example

```
75%

✔ Team Invited

✔ Lead Created

○ Branding

○ Custom Fields
```

Hidden once setup completes.

---

# Welcome Modal

Shown only once.

Contains

Welcome

Quick Links

Documentation

Keyboard Shortcuts

Dismiss forever.

---

# Product Tour

Optional.

Highlights

Sidebar

Dashboard

Lead Table

Notifications

Settings

Skip anytime.

Never force the tour.

---

# Checklist

Dashboard may display

```
Getting Started

✔ Invite Team

✔ Create Lead

○ Create Form

○ Customize Branding
```

Completing checklist hides it permanently.

---

# Returning Users

Owners who have completed onboarding

always land directly on

Dashboard.

No onboarding screens reappear.

---

# Invitation Experience

Invited users see

Welcome

Organization Name

Assigned Role

Quick Introduction

CTA

```
Go to Dashboard
```

No setup wizard.

---

# Email Content

Invitation Email

Organization Name

Inviter Name

Assigned Role

Accept Invitation Button

Expiration Notice

---

# Help Resources

Accessible during onboarding.

Links

Documentation

Support Email

FAQ

Never force users to leave onboarding.

---

# Accessibility

Wizard fully keyboard accessible.

Progress announced to screen readers.

Visible focus states.

Semantic headings.

---

# Mobile Experience

Wizard becomes single column.

Sticky footer actions.

Large touch targets.

Progress bar remains visible.

---

# Analytics Events

Future implementation may track

Organization Created

Invitation Sent

Lead Created

Lead Form Created

Setup Completed

Skipped Step

Analytics are out of scope for v1.

---

# Completion Criteria

Setup is considered complete when

Owner finishes the wizard

OR

Owner manually skips the final step.

Users can still access all skipped features later.

---

# Future Expansion

The onboarding architecture supports

Interactive Tutorials

Video Guides

AI Assistant

Import Existing CRM

CSV Import

Workflow Templates

without changing the overall flow.

---

# UX Goals

A new user should

Understand the product

Invite teammates

Capture their first lead

Reach the dashboard

within five minutes.

The onboarding experience should build confidence without delaying productive work.

---

End of Onboarding Document
