# docs/05-design-system.md

# SalesPilot Design System

Version: 1.0

Status: Final

---

# Purpose

This document defines the complete visual language of SalesPilot.

The goal is to create a product that feels like a premium SaaS application rather than a generic admin dashboard.

Every screen must feel like it belongs to the same product.

Consistency always wins over creativity.

---

# Design Philosophy

SalesPilot should communicate

- Professional
- Modern
- Fast
- Trustworthy
- Minimal
- Spacious

The interface should disappear behind the user's work.

Avoid visual noise.

Every component should earn its place.

---

# Design Inspiration

Take inspiration from

✓ Linear

✓ Attio

✓ Vercel Dashboard

✓ Stripe Dashboard

✓ Notion

✓ GitHub

Use inspiration only.

Never copy layouts.

---

# Avoid

Do NOT resemble

Bootstrap Admin

AdminLTE

Metronic

Material Dashboard

TemplateMonster

Keen Themes

Heavy Enterprise CRM

The application should never look like an off-the-shelf admin template.

---

# Theme

Dark Mode

✓ Supported

Light Mode

✓ Default

System Theme

✓ Supported

Use CSS variables for theming.

Never hardcode colors.

---

# Typography

Font

```
Inter Variable
```

Fallback

```
system-ui

sans-serif
```

Never mix fonts.

---

# Font Scale

Display XL

```
60px
700
```

Display LG

```
48px
700
```

Display MD

```
40px
700
```

Heading 1

```
32px
700
```

Heading 2

```
28px
700
```

Heading 3

```
24px
600
```

Heading 4

```
20px
600
```

Heading 5

```
18px
600
```

Body Large

```
16px
400
```

Body

```
14px
400
```

Small

```
13px
400
```

Caption

```
12px
400
```

Button

```
14px
600
```

Labels

```
13px
500
```

Never invent additional typography sizes.

---

# Line Heights

Display

```
110%
```

Headings

```
120%
```

Body

```
150%
```

Caption

```
140%
```

---

# Letter Spacing

Display

```
-2%
```

Heading

```
-1%
```

Body

```
0%
```

---

# 8 Point Grid

Every spacing value must be derived from the following system.

```
4

8

12

16

20

24

32

40

48

56

64

72

80

96

128
```

Avoid arbitrary spacing values.

---

# Border Radius

Small

```
6px
```

Default

```
10px
```

Card

```
16px
```

Dialog

```
20px
```

Pill

```
999px
```

Never use square corners.

---

# Shadows

Small

```
Very subtle
```

Medium

```
Cards
```

Large

```
Dialogs
```

XL

```
Marketing Hero
```

Avoid exaggerated shadows.

SalesPilot uses depth sparingly.

---

# Color Palette

Primary

```
Blue
```

Accent

```
Violet
```

Success

```
Emerald
```

Warning

```
Amber
```

Danger

```
Red
```

Info

```
Sky
```

Neutral

```
Slate
```

Use Tailwind defaults unless branding overrides them.

---

# Semantic Colors

Never reference colors directly.

Use semantic tokens.

Good

```
bg-primary

text-muted

border-default
```

Bad

```
bg-blue-500

text-red-500
```

---

# Layout Width

Marketing

```
1280px
```

Dashboard

```
100%
```

Forms

```
720px
```

Authentication

```
420px
```

Dialogs

```
720px
```

---

# Sidebar

Width

```
280px
```

Collapsed

```
72px
```

Background

Subtle neutral.

Active navigation

Primary background.

Hover

Muted background.

Icons

20px

Labels

14px

Sidebar remains fixed.

---

# Top Navigation

Height

```
64px
```

Contains

Logo

Search

Notifications

Profile

Organization

Never overload navigation.

---

# Cards

Border Radius

```
16px
```

Padding

```
24px
```

Header

```
20px
```

Gap

```
16px
```

Cards should have subtle borders.

Avoid heavy shadows.

---

# Buttons

Sizes

Small

36px

Medium

40px

Large

44px

Variants

Primary

Secondary

Outline

Ghost

Destructive

Link

Loading

Disabled

Buttons always contain hover states.

Never use gradients.

---

# Inputs

Height

```
40px
```

Radius

```
10px
```

States

Default

Hover

Focus

Error

Disabled

Read Only

Never remove focus indicators.

---

# Textarea

Minimum Height

```
120px
```

Auto Resize

✓

---

# Select

Consistent with inputs.

Keyboard accessible.

Search support where necessary.

---

# Tables

Dense but readable.

Row Height

```
48px
```

Header

Sticky.

Hover

Subtle.

Selection

Checkbox.

Pagination

Bottom.

Support

Sorting

Filtering

Search

Bulk Actions

Empty State

Loading

---

# Status Badges

Rounded.

Small.

Examples

New

Blue

Qualified

Green

Won

Emerald

Lost

Red

Archived

Slate

Never rely only on color.

Include text.

---

# Tags

Rounded pills.

Minimal.

Used for

Roles

Sources

Labels

Custom Fields

---

# Dialogs

Width

```
720px
```

Contain

Title

Description

Content

Actions

Escape closes.

Overlay click closes unless destructive.

---

# Drawers

Use for

Large Forms

Settings

Merge Wizard

Responsive.

---

# Toasts

Position

Top Right

Duration

4 Seconds

Variants

Success

Error

Warning

Info

Maximum

3 Visible

---

# Loading

Every page must have

Skeleton

Never use

Loading...

text.

---

# Empty States

Every list requires one.

Include

Illustration

Title

Description

Primary Action

Never show empty tables.

---

# Error States

Friendly.

Actionable.

Retry button where possible.

Never expose stack traces.

---

# Icons

Lucide only.

16px

20px

24px

No mixed icon packs.

---

# Charts

Library

Recharts

Style

Minimal.

Rounded bars.

Thin grid.

Soft colors.

No 3D.

No gradients.

No chart junk.

---

# Motion

Fast

```
150ms
```

Normal

```
200ms
```

Slow

```
300ms
```

Use easing.

Never bounce.

Avoid excessive animations.

---

# Forms

Spacing

24px

Labels above inputs.

Required fields

*

Validation below field.

Never use placeholder as label.

---

# Marketing Website

Should feel premium.

Sections

Hero

Feature Grid

Product Preview

Pricing

FAQ

CTA

Footer

Lots of whitespace.

Large typography.

Soft gradients.

Minimal borders.

---

# Authentication

Centered Card

Logo

Title

Description

Form

Divider

OAuth

Footer

Simple.

Minimal.

---

# Dashboard

Should feel like

Attio

Linear

Modern CRM

Cards

Metrics

Charts

Recent Activity

Quick Actions

Minimal chrome.

---

# Tables

Primary work surface.

Features

Sticky Header

Column Visibility

Search

Filters

Sorting

Bulk Selection

Pagination

Responsive

---

# Responsive Breakpoints

Mobile

```
<640
```

Tablet

```
640-1023
```

Desktop

```
1024+
```

Large Desktop

```
1440+
```

No horizontal scrolling except data tables.

---

# Accessibility

WCAG AA

Visible focus

Keyboard navigation

Semantic HTML

ARIA Labels

Proper contrast

Screen reader friendly

---

# Branding

Organization branding affects

Logo

Primary Color

Public Forms

Public Pages

Dashboard structure and UX remain consistent.

SalesPilot identity should still be recognizable.

Footer

```
Powered by SalesPilot
```

---

# UX Principles

Every screen should answer

Where am I?

What can I do?

What should I do next?

Avoid dead ends.

---

# Design Rules

Never use

- Multiple accent colors
- Heavy gradients
- Glassmorphism
- Neumorphism
- Random spacing
- Inconsistent typography
- Inline colors
- Inline styles

Prefer

Whitespace

Hierarchy

Contrast

Consistency

---

# Final Goal

A reviewer should immediately think:

"This looks like a real SaaS product."

Not

"This looks like a coding assignment."

---

End of Design System
