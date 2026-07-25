# docs/27-deployment-infrastructure.md

# Deployment & Infrastructure Guide

Project: SalesPilot

Version: 1.0

Status: Final

---

# Purpose

This document defines the deployment architecture for SalesPilot.

The infrastructure should be

- Reliable
- Secure
- Scalable
- Cost Effective
- Easy to Operate

Infrastructure decisions should remain independent of business logic.

---

# Design Goals

The infrastructure should be

✓ Cloud Native

✓ Provider Agnostic

✓ Highly Available

✓ Observable

✓ Secure

✓ Easy to Deploy

---

# High-Level Architecture

```
                Internet
                    │
                    ▼
            Cloudflare DNS
                    │
                    ▼
             CDN / Edge Cache
                    │
                    ▼
          Next.js Application
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
   MongoDB Atlas          Object Storage
                               │
                               ▼
                           AWS S3
```

Future providers should be replaceable with minimal changes.

---

# Deployment Targets

Recommended

Application

```
Vercel
```

Database

```
MongoDB Atlas
```

Storage

```
AWS S3
```

Alternative deployments

```
Railway

Fly.io

Render

AWS ECS

DigitalOcean App Platform
```

---

# Environment Separation

Every environment is isolated.

```
Development

↓

Staging

↓

Production
```

No shared databases.

No shared storage buckets.

---

# Environment Variables

Examples

```
DATABASE_URL

BETTER_AUTH_SECRET

NEXT_PUBLIC_APP_URL

STORAGE_PROVIDER

S3_BUCKET

S3_REGION

S3_ENDPOINT

S3_ACCESS_KEY

S3_SECRET_KEY

TURNSTILE_SECRET

TURNSTILE_SITE_KEY
```

Never commit secrets to Git.

---

# Secret Management

Store secrets using the deployment platform.

Examples

```
Vercel Environment Variables

GitHub Secrets

AWS Secrets Manager (future)
```

Never hardcode credentials.

---

# Build Pipeline

```
Git Push

↓

GitHub Actions

↓

Lint

↓

Type Check

↓

Tests

↓

Build

↓

Deploy
```

Deployment only occurs if every step succeeds.

---

# CI Pipeline

Required steps

```
Install Dependencies

↓

Lint

↓

Type Check

↓

Unit Tests

↓

Integration Tests

↓

Build

↓

Deploy
```

---

# Branch Strategy

```
main

Production

develop

Staging

feature/*

Development
```

Every feature is developed in its own branch.

---

# Deployment Strategy

Version 1

Rolling deployment.

Future

Blue-Green Deployment

Canary Releases

Feature Flags

---

# Database

Provider

```
MongoDB Atlas
```

Recommendations

Automatic Backups

Monitoring Enabled

Atlas Search Enabled

TLS Enabled

---

# Database Migrations

Deploy flow

```
Build

↓

Run Prisma Migrations

↓

Deploy Application
```

Failed migrations should stop deployment.

---

# Storage

Provider

```
AWS S3
```

Recommendations

Private Bucket

Versioning (future)

Lifecycle Rules

Encryption Enabled

---

# CDN

Version 1

Static assets served through Vercel CDN.

Future

CloudFront

Cloudflare CDN

---

# Domain

Production

```
salespilot.com
```

Example

Application

```
app.salespilot.com
```

Marketing

```
salespilot.com
```

API

```
api.salespilot.com (future)
```

---

# HTTPS

Required

TLS

↓

Automatic Renewal

↓

HSTS Enabled

HTTP traffic redirects to HTTPS.

---

# Caching

Cache

Static Assets

↓

Long TTL

Dynamic API

↓

No Cache

Dashboard widgets use client-side caching via TanStack Query.

---

# Logging

Application logs

```
Structured JSON
```

Fields

```
Timestamp

Level

Request ID

User ID

Organization ID

Message
```

Never log sensitive data.

---

# Monitoring

Version 1

Platform logs

Health checks

Future

OpenTelemetry

Grafana

Prometheus

Datadog

---

# Error Tracking

Recommended

```
Sentry
```

Capture

Unhandled Exceptions

Server Errors

Client Errors

Stack Traces

Release Versions

---

# Health Checks

Endpoint

```
GET /api/health
```

Response

```json
{
    "status": "ok"
}
```

Future

Database

Storage

Search

Connectivity

---

# Rate Limiting

Protect

Authentication

Public Forms

Password Reset

Future

Redis-backed distributed rate limiting.

---

# Security Headers

Enable

```
Content-Security-Policy

Strict-Transport-Security

X-Frame-Options

X-Content-Type-Options

Referrer-Policy
```

Review periodically.

---

# File Uploads

Uploads go directly to object storage through signed URLs.

Application servers should not proxy large files.

---

# Backup Strategy

Database

Daily automated backups.

Storage

Provider lifecycle/versioning.

Future

Organization-level export.

---

# Disaster Recovery

Objectives

```
Database Restore

↓

Redeploy Application

↓

Reconnect Storage

↓

Resume Service
```

Document recovery procedures.

---

# Scheduled Jobs

Future

Cleanup temporary uploads

Send digest emails

Archive notifications

Generate reports

Cron implementation should remain independent of application requests.

---

# Performance Goals

Application

```
Cold Start

<2 seconds
```

API

```
<300 ms
```

Dashboard

```
<500 ms
```

Search

```
<300 ms
```

---

# Scaling

Application

Stateless horizontal scaling.

Database

Managed scaling through Atlas.

Storage

Object storage scales independently.

---

# Infrastructure as Code

Future

```
Terraform

AWS CDK

Pulumi
```

Version 1 may use platform-managed infrastructure.

---

# Observability

Every request should include

```
Request ID

Organization ID

User ID
```

Used consistently in

Logs

Errors

Tracing

---

# Release Process

```
Merge to Main

↓

CI Pipeline

↓

Tests

↓

Build

↓

Deploy

↓

Health Check

↓

Production
```

Automatic rollback should be considered for future releases.

---

# Rollback Strategy

If deployment fails

```
Previous Deployment

↓

Restore

↓

Investigate

↓

Fix

↓

Redeploy
```

Database rollback procedures should be documented separately.

---

# Dependencies

Keep runtime dependencies updated.

Schedule

Monthly dependency review.

Critical security updates should be applied immediately.

---

# Security

Never expose

Secrets

Database credentials

Storage credentials

Internal endpoints

Rotate secrets periodically.

---

# Future Infrastructure

Architecture supports

Redis

Queues

Background Workers

WebSockets

Email Workers

Search Clusters

Analytics Pipeline

without requiring changes to business modules.

---

# Design Principles

Infrastructure should remain replaceable.

Business modules should not depend on deployment platform features.

Application code should remain portable across cloud providers.

---

# Success Criteria

The deployment architecture should

Support automated deployments

Protect sensitive data

Scale with demand

Recover from failures

Remain straightforward to operate

without introducing unnecessary operational complexity.

---

End of Deployment & Infrastructure Guide
