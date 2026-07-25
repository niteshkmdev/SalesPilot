# docs/10-landing-page.md

# Marketing Website Specification

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

The marketing website is the public face of SalesPilot.

Its objectives are to:

- Explain the product
- Build trust
- Demonstrate value
- Convert visitors into users

It should feel like a modern SaaS product—not a corporate brochure.

---

# Design Goals

The landing page should communicate

✓ Simplicity

✓ Speed

✓ Professionalism

✓ Trust

✓ Productivity

✓ Modern SaaS

The design should rely on typography, whitespace, and hierarchy rather than decorative elements.

---

# Visual Inspiration

The landing page should draw inspiration from

- Linear
- Vercel
- Stripe
- Attio
- Notion

Avoid

- Template landing pages
- Excessive gradients
- Stock-photo-heavy layouts
- Marketing buzzwords

---

# Layout

Maximum Width

```
1280px
```

Content Width

```
1200px
```

Section Padding

```
96px
```

Container Padding

```
24px
```

---

# Navigation

Sticky

Transparent initially.

Solid background after scrolling.

Contains

Logo

Features

Pricing

FAQ

Login

Get Started

CTA button remains visible.

---

# Hero Section

Purpose

Immediately explain

- What SalesPilot is
- Who it is for
- Why it's valuable

---

Headline

Large

Clear

Benefit-oriented.

Example style

```
Manage every lead from one modern workspace.
```

Avoid vague slogans.

---

Subheading

One or two sentences.

Should explain

- Lead capture
- Team collaboration
- Pipeline visibility

---

Primary CTA

```
Get Started
```

---

Secondary CTA

```
Live Demo
```

---

Hero Visual

Large product screenshot.

Use realistic dashboard data.

Avoid fake illustrations.

---

Trust Indicators

Optional.

Examples

```
Secure Authentication

Role-Based Access

Fast Setup

Responsive
```

---

# Feature Section

Grid

3 × 2

Each feature includes

Icon

Title

Description

---

Suggested Features

Lead Management

Lead Assignment

Custom Forms

Role-Based Access

Search

Activity Timeline

---

# Product Preview

Large dashboard preview.

Call out

Pipeline

Charts

Tables

Notifications

Use subtle annotations.

---

# Workflow Section

Explain the product in three steps.

Example

```
Capture

↓

Manage

↓

Close
```

Each step includes

Illustration

Description

---

# Statistics Section

Optional.

Examples

```
Unlimited Leads

Fast Search

Secure Authentication

Real-Time Dashboard
```

Avoid fabricated business metrics.

---

# Pricing

Single pricing tier.

Free Trial

or

Simple Monthly Plan

No complex pricing tables.

Out of scope

Billing implementation.

---

Pricing Card

Contains

Price

Features

CTA

---

# FAQ

Accordion.

Suggested Questions

What is SalesPilot?

Can multiple users collaborate?

Does it support custom lead forms?

Is data secure?

Can I upload files?

How are permissions managed?

---

# Call to Action

Large section before footer.

Headline

Strong action.

CTA

```
Start Managing Leads Today
```

---

# Footer

Contains

Logo

Navigation

Documentation

Privacy

Terms

Contact

Social Links (optional)

Required Credit

```
Powered by SalesPilot
```

---

# Login Entry Points

Navigation

Footer

Hero CTA

Pricing CTA

All should eventually direct users to authentication.

---

# Responsive Layout

Desktop

Two-column hero.

Tablet

Stacked hero.

Mobile

Single column.

Buttons become full width where appropriate.

---

# Accessibility

Keyboard accessible.

Semantic landmarks.

Proper heading hierarchy.

Alt text for all images.

Sufficient color contrast.

---

# SEO

Every page should include

Title

Description

Open Graph

Twitter Card

Canonical URL

Structured metadata where appropriate.

---

# Performance

Landing page should

- Server render by default
- Optimize images
- Lazy load screenshots
- Avoid unnecessary JavaScript

Target excellent Core Web Vitals.

---

# Animation

Use subtle motion only.

Allowed

Fade

Slide

Scale

Avoid

Bounce

Parallax

Continuous animations

Animations should enhance, not distract.

---

# Sections Order

```
Navigation

↓

Hero

↓

Trusted Features

↓

Product Preview

↓

Workflow

↓

Feature Grid

↓

Pricing

↓

FAQ

↓

Call To Action

↓

Footer
```

---

# Copy Guidelines

Copy should be

Clear

Direct

Benefit-focused

Avoid

Buzzwords

Exaggeration

Technical jargon

Example

Good

```
Assign leads to your team in seconds.
```

Bad

```
Revolutionize your customer engagement ecosystem.
```

---

# Images

Use

Application screenshots

Simple illustrations

Minimal iconography

Avoid

Stock business photos

People shaking hands

Office lifestyle imagery

---

# Empty States

If product previews contain tables or dashboards,

populate them with realistic demo data.

Never display empty interfaces on the marketing site.

---

# Branding

Primary SalesPilot branding is always shown.

Organization branding does not apply to marketing pages.

---

# Analytics

Architecture should allow integration with

Google Analytics

PostHog

Plausible

without changing page structure.

Analytics implementation is out of scope.

---

# Future Expansion

The landing page architecture should support

Blog

Documentation

Changelog

Roadmap

Customer Stories

Feature Announcements

without restructuring navigation.

---

# Success Criteria

A first-time visitor should understand within 10 seconds

- What SalesPilot does
- Who it is for
- Why it is useful
- How to get started

The page should feel polished enough that it could serve as the public website for a commercial SaaS product.

---

End of Landing Page Specification
