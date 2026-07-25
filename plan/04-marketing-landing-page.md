# Plan 04: Marketing Landing Page

## Objective

Plan and build the public homepage with documented SalesPilot messaging, realistic CRM visual treatment, CTAs, FAQ, footer, responsive behavior, accessibility, and design-system compliance.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete
- Current task: Revalidation close-out finished — product-complete copy, `/Hero.png` showcase, FAQ accordion, final CTA.
- Dependency: `03-app-shell-navigation`
- Next: restore active `06-leads-management`

## Task Checklist

- `[x]` Read docs (`docs/10-landing-page.md`, design system, coding standards) and `prompt/04-marketing-landing-page.md`.
- `[x]` Rewrite hero, features, pricing, workflow, and FAQ in complete-product voice (no static-data disclaimers).
- `[x]` Replace CSS dashboard mock with `/Hero.png` via `next/image`; add product preview section.
- `[x]` Add final CTA band before footer.
- `[x]` Validate responsive/a11y anchors (Features, Product, Pricing, FAQ) and session-aware CTAs.
- `[x]` Update `PROJECT_TRACKER.md` and `AGENTS.md` Plan Index re-check; mark plan `[x]`.

## Implementation Rules

- Follow `docs/10-landing-page.md` layout and messaging.
- Public marketing copy treats the documented MVP as complete.
- Use existing UI primitives and design tokens; no decorative template clutter.
- Keep auth-aware CTAs (Login / Get Started vs Go to Dashboard).
