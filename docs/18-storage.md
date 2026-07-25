# docs/18-storage.md

# Storage Module

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

The Storage module provides a secure, scalable, and provider-agnostic way to manage files across SalesPilot.

Version 1 primarily supports lead attachments, but the architecture is designed to support future file use cases such as profile images, organization logos, document libraries, and exports.

---

# Design Goals

The Storage module should be

✓ Secure

✓ Scalable

✓ Provider Agnostic

✓ Efficient

✓ Easy to Replace

✓ Future Proof

Business modules should never communicate directly with a storage provider.

---

# Storage Philosophy

Storage is infrastructure.

Business modules request file operations.

They should never know whether files are stored in

- AWS S3
- Cloudflare R2
- MinIO
- DigitalOcean Spaces

---

# Architecture

```
Lead Module
        │
        ▼
Storage Service
        │
        ├── S3 Provider
        ├── R2 Provider
        ├── MinIO Provider
        └── Future Providers
```

Only the Storage Service communicates with cloud storage.

---

# Responsibilities

The Storage Service handles

✓ Uploads

✓ Downloads

✓ Signed URLs

✓ Validation

✓ File Deletion

✓ Metadata

✓ Provider Selection

Business logic remains outside the service.

---

# Supported Storage Providers

Version 1

```
AWS S3
```

Compatible Providers

```
Cloudflare R2

MinIO

DigitalOcean Spaces

Backblaze B2
```

Future

```
Azure Blob Storage

Google Cloud Storage
```

Providers should be interchangeable through configuration.

---

# Upload Flow

```
User

↓

Select File

↓

Client Validation

↓

Upload API

↓

Storage Service

↓

Storage Provider

↓

Metadata Saved

↓

Success Response
```

---

# File Metadata

Only metadata is stored in MongoDB.

Example

```
ID

Organization ID

Uploaded By

Original Name

Stored Name

Content Type

Size

Storage Key

Created At
```

Binary data is never stored in MongoDB.

---

# Storage Key

Each uploaded file receives a unique storage key.

Example

```
organizations/

org_123/

attachments/

lead_456/

3b2fa7.pdf
```

The storage key is immutable.

---

# Folder Structure

Recommended convention

```
organizations/

    org_id/

        branding/

        leads/

            lead_id/

        exports/

        profile-images/

        temp/
```

Folder names are logical.

Object storage providers may not implement real folders.

---

# File Naming

Original filenames are preserved for display only.

Stored filenames use generated identifiers.

Example

```
Original

Contract.pdf

↓

Stored

4d8b3e91.pdf
```

Avoid filename collisions.

---

# Supported File Types

Version 1

```
Images

PDF

DOC

DOCX

XLS

XLSX

PPT

PPTX

TXT
```

Future

ZIP

CSV

Video

Audio

---

# File Size Limits

Default

```
25 MB
```

Future

Organization-specific limits.

Large uploads may use multipart upload.

---

# Validation

Client validates

Extension

↓

Size

↓

Basic MIME

Server validates

Extension

↓

Content Type

↓

Maximum Size

↓

Organization Permission

Never trust client validation.

---

# MIME Type Validation

Allowed examples

```
application/pdf

image/png

image/jpeg

application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Validation should use MIME type rather than filename extension alone.

---

# Upload Permissions

Only authorized users may upload.

Examples

Members

↓

Assigned Leads

Managers

↓

Team Leads

Admins

↓

Organization Files

Permissions are enforced server-side.

---

# Signed URLs

Clients never receive permanent storage credentials.

Download flow

```
Client

↓

Request File

↓

Signed URL

↓

Temporary Access

↓

Download
```

---

# Signed URL Expiration

Default

```
15 Minutes
```

Expiration should be configurable.

---

# Public Files

Version 1

Only public lead forms may expose public assets such as organization logos.

Lead attachments remain private.

---

# Private Files

Lead attachments

Exports

Future backups

remain private.

Access requires authorization.

---

# File Deletion

Deleting a file

↓

Delete Metadata

↓

Delete Storage Object

↓

Create Activity

Deletion should be transactional where possible.

---

# Soft Delete

Version 1

Files are permanently deleted.

Future

Soft delete

Recovery

Retention policy

---

# Replacing Files

Replacing an attachment

↓

Upload New File

↓

Update Metadata

↓

Delete Old Object

↓

Activity

Avoid orphaned files.

---

# Cleanup

Temporary uploads should expire automatically.

Example

```
24 Hours
```

Future

Scheduled cleanup job.

---

# Virus Scanning

Out of scope for Version 1.

Future

Upload

↓

Virus Scan

↓

Available

or

Quarantined

---

# Image Processing

Out of scope.

Future

Thumbnail Generation

Image Optimization

Compression

WebP Conversion

---

# Downloads

Download flow

```
User

↓

Authorization

↓

Signed URL

↓

Cloud Storage

↓

Download
```

Application servers should not proxy large files.

---

# Storage Abstraction

Example Interface

```ts
interface StorageService {
    upload()
    delete()
    getSignedUrl()
    exists()
}
```

Business modules depend only on this interface.

---

# Error Handling

Examples

Upload Failed

Invalid File Type

File Too Large

Storage Unavailable

Every error should provide a user-friendly message.

---

# Activity Events

Generate activities for

File Uploaded

File Deleted

File Replaced

Activities remain immutable.

---

# API Endpoints

```
POST /uploads

DELETE /uploads/{id}

GET /uploads/{id}/url
```

Future

```
PATCH /uploads/{id}
```

---

# Performance

Goals

Direct cloud uploads

Minimal server memory usage

Signed URLs

Streaming downloads

Avoid loading large files into application memory.

---

# Caching

Signed URLs should not be cached.

Static public assets may be cached through a CDN.

---

# CDN

Future

```
CloudFront

Cloudflare CDN

Fastly
```

The storage service should remain independent of CDN implementation.

---

# Security

Never expose

Bucket Names

Storage Credentials

Internal Paths

Permanent URLs

Every download requires authorization unless explicitly public.

---

# Accessibility

Upload controls support

Keyboard Navigation

Screen Readers

Drag and Drop

Progress Indicators

Clear Error Messages

---

# Mobile Experience

Support

Camera Upload

Gallery Selection

Document Picker

Responsive upload progress

---

# Configuration

Environment variables

```
STORAGE_PROVIDER

S3_BUCKET

S3_REGION

S3_ACCESS_KEY

S3_SECRET_KEY

S3_ENDPOINT
```

Changing providers should require configuration only.

---

# Future Features

Architecture supports

Multipart Uploads

Versioning

File Encryption

Virus Scanning

CDN Integration

Image Processing

Retention Policies

Storage Quotas

without redesigning the Storage Service.

---

# Design Principles

Storage should be invisible to feature modules.

The application should never depend on provider-specific APIs outside the Storage module.

Replacing AWS S3 with another provider should require changing only the storage provider implementation.

---

# Success Criteria

The Storage module should

Upload securely

Store efficiently

Protect private files

Support multiple providers

Scale with application growth

without requiring changes to business modules.

---

End of Storage Module
