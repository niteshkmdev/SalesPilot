# Plan 14: Branding (Org + User) with S3 signed uploads

## Objective

Organization logo branding (header + public forms with per-form display mode) and expanded user profile (avatar, phone, gender, password, Google link/unlink), backed by a minimal S3 presigned-upload slice using CloudFront public URLs.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

## Current Status

- Overall status: `[x]` Complete
- Current task: Closed — storage presign, org branding, form display mode, user profile
- Dependency: Plan 05 (settings); minimal storage slice replaces full Plan 13 for logos/avatars only
- Next: `prompt/15-testing-quality-hardening.md` (or revisit Plan 13 for lead attachments)

## Assumptions / deviations

1. **Skip full Plan 13** lead attachments; reuse minimal `src/modules/storage/` for org logos + user avatars only.
2. Uploads: browser → S3 presigned PUT → store CloudFront URL (`CLOUDFRONT_CDN_MEDIA_URL` + key).
3. Org color fields remain in schema; **no color picker UI** this wave.
4. Google `User.image` kept until custom upload; remove clears to `null` (initials fallback).
5. Gender: Male / Female / Other / Prefer not to say / blank.
6. Account linking: same-email Google only (`allowDifferentEmails: false`).

## Task Checklist

- `[x]` Minimal storage module + `POST /api/v1/uploads/presign` + CloudFront env
- `[x]` Org branding service/UI; header `AvatarImage`; AppContext logo
- `[x]` `LeadForm.brandingDisplay` + editor gating + public form render
- `[x]` User phone/gender/avatar/password/Google link-unlink on profile
- `[x]` Unit tests (keys/publicUrl, brandingDisplay gating)
- `[x]` Update tracker / AGENTS on completion

## Out of scope

- Lead attachments / multipart / full Plan 13
- Org color theming UI
- Email change
- Non-image uploads
