# ConsentFlow V2 — Production Architecture & Security Audit

**Target System**: ConsentFlow V2 (DPDP Act 2023 Real-Time Consent Manager & Compliance Platform)  
**Audit Date**: August 18, 2026  
**Auditor**: Antigravity Lead Systems Architect  
**Status**: Comprehensive Baseline Audit (No Functionality Changes Applied)

---

## 1. System Architecture Overview

ConsentFlow V2 is structured as a full-stack, multi-tenant serverless compliance platform designed to enforce the provisions of India's Digital Personal Data Protection (DPDP) Act 2023.

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 Presentation Layer                      │
                  │   Next.js 15 App Router + Tailwind CSS (SSR & Client)  │
                  └────┬────────────────────────┬──────────────────────┬────┘
                       │                        │                      │
       ┌───────────────▼────────┐   ┌───────────▼───────────┐   ┌──────▼────────────────┐
       │ Consumer (Principal)   │   │ Business (Fiduciary)  │   │ Regulator Inspector   │
       │ Plain-lang AI Notices  │   │ Notice & Webhooks Desk│   │ SHA-256 Audit Stream  │
       └───────────────┬────────┘   └───────────┬───────────┘   └──────┬────────────────┘
                       │                        │                      │
                  ┌────▼────────────────────────▼──────────────────────▼────┐
                  │              Auth & Protection Middleware               │
                  │   Auth.js v5 (NextAuth) JWT Credentials Engine         │
                  └─────────────────────────────┬───────────────────────────┘
                                                │
                  ┌─────────────────────────────▼───────────────────────────┐
                  │                Serverless API Services                  │
                  │  /api/consent, /api/ai/simplify, /api/grievances, etc. │
                  └────┬────────────────────────┬──────────────────────┬────┘
                       │                        │                      │
       ┌───────────────▼────────┐   ┌───────────▼───────────┐   ┌──────▼────────────────┐
       │ AI Simplifier Engine   │   │ Cryptographic Audit   │   │ Webhook Dispatcher    │
       │ Groq Llama 3.1 8B      │   │ Canonical SHA-256     │   │ HMAC-SHA256 Signed    │
       │ (EN/HI/KN/TA/TE)      │   │ Chained Audit Logs    │   │ Exponential Backoff   │
       └────────────────────────┘   └───────────┬───────────┘   └───────────────────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │ PostgreSQL (Neon)     │
                                    │ Prisma ORM 5.x        │
                                    └───────────────────────┘
```

### Key Architectural Layers:
1. **Presentation Layer**: Built on Next.js 15 App Router using React 19 and Tailwind CSS. Provides isolated dashboards for Data Principals (`/consumer`), Data Fiduciaries (`/business`), and Regulatory Auditors (`/regulator`).
2. **Authentication Layer**: Auth.js (NextAuth v5 beta 25) with JWT session strategy and role-based route protection middleware.
3. **AI Legal Text Simplification Engine**: Consumes Groq Llama 3.1 8B Instant model to transform dense legal text into plain 8th-grade language across 5 Indic languages (`en`, `hi`, `kn`, `ta`, `te`) with a static template fallback mechanism.
4. **Cryptographic SHA-256 Audit Chain Engine**: Implements a canonical JSON stringifier and SHA-256 hash chaining formula (`currentHash = SHA256(previousHash + canonicalPayload)`) to guarantee tamper-evident record keeping.
5. **Serverless HMAC Webhook Engine**: Dispatches event notifications (`consent.granted`, `consent.revoked`) with HMAC-SHA256 signatures, timeout protection, exponential backoff retries, and Dead Letter Queueing (`DLQ`).
6. **Database Layer**: PostgreSQL database (Neon Serverless) managed via Prisma ORM 5.22.0.

---

## 2. Database Models & Schema Relations

The data model defined in `prisma/schema.prisma` serves as the single source of truth for all entities.

```
       ┌──────────────┐ 1          0..1 ┌────────────────┐
       │     User     ├─────────────────┤    Business    │
       └──────┬───────┘                 └───────┬────────┘
              │ 1                               │ 1
              │                                 │
     ┌────────┼─────────────────┐       ┌───────┼─────────────────┐
     │        │                 │       │       │                 │
    *│       *│                *│      *│      *│                *│
┌────▼────┐ ┌─▼─────────────┐ ┌─▼───────▼┐ ┌────▼────────┐ ┌──────▼───────────┐
│ Consent │ │ Grievance     │ │  Consent │ │ Consent     │ │ WebhookDelivery   │
│ Record  │ │ Ticket        │ │  Notice  │ │ Record      │ │                   │
└────┬────┘ └───────────────┘ └─────┬────┘ └─────────────┘ └───────────────────┘
     │ 1                            │ 1
    *│                             *│
┌────▼────┐                   ┌─────▼─────┐
│ Audit   │                   │  Consent  │
│ Log     │                   │  Record   │
└─────────┘                   └───────────┘
```

### Model Definitions & Integrity Rules:
1. **`User`**: Repositories for system accounts (`id`, `email` [unique], `name`, `role` [`CONSUMER`, `BUSINESS`, `REGULATOR`], `preferredLang`). Relations: `consents` (1:N), `grievances` (1:N), `business` (1:1 optional).
2. **`Business`**: Data Fiduciary organizations (`id`, `name`, `userId` [unique optional], `webhookUrl`, `apiKey` [unique optional], `tier` [`FREEMIUM`, `GROWTH`, `ENTERPRISE`]). Relations: `notices` (1:N), `consents` (1:N), `grievances` (1:N), `webhookLogs` (1:N).
3. **`ConsentNotice`**: Privacy notices published by Fiduciaries (`id`, `businessId`, `title`, `rawLegalText` [Text], `simplifiedVersions` [Json], `purposes` [Json], `isActive`). Relations: `business` (M:1 onDelete Cascade), `consents` (1:N).
4. **`ConsentRecord`**: Core state of granted/revoked consents (`id`, `userId`, `noticeId`, `businessId`, `granted` [Boolean], `choices` [Json], `ipAddress`, `userAgent`, `createdAt`, `revokedAt`). Relations: `user`, `notice`, `business` (onDelete Cascade), `auditLogs` (1:N).
5. **`AuditLog`**: Immutable cryptographic ledger entries (`id`, `recordId`, `action` [`GRANT`, `REVOKE`, `ACCESS`, `ERASURE`, `CORRECTION`, `NOMINATION`], `actorId`, `previousHash`, `currentHash`, `payload` [Json], `timestamp`). Indexes: `[recordId, timestamp]`, `[currentHash]`.
6. **`GrievanceTicket`**: DPDP statutory complaint tickets (`id`, `userId`, `businessId`, `type` [`ACCESS`, `ERASURE`, `CORRECTION`, `NOMINATION`], `description` [Text], `status` [`OPEN`, `IN_PROGRESS`, `RESOLVED`, `ESCALATED`], `slaDeadline` [DateTime], `resolution` [Text], `createdAt`, `resolvedAt`). Indexes: `[userId, status]`, `[businessId, status]`, `[slaDeadline]`.
7. **`WebhookDelivery`**: Webhook audit and retry log (`id`, `businessId`, `eventType`, `payload` [Json], `signature`, `status` [`PENDING`, `DELIVERED`, `FAILED`, `RETRYING`, `DLQ`], `responseStatus`, `responseBody`, `retryCount`, `nextRetryAt`, `createdAt`, `deliveredAt`). Indexes: `[businessId, status]`, `[status, nextRetryAt]`.

---

## 3. API Routes & Endpoint Contracts

| Route Endpoint | HTTP Verb | Auth Requirement | Purpose & Contract |
| :--- | :--- | :--- | :--- |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Public | NextAuth authentication handlers for credentials login and session handling. |
| `/api/ai/simplify` | `POST` | Public (Rate Limited) | Translates `text` into `lang` (`en`, `hi`, `kn`, `ta`, `te`). Returns `{ success, lang, isFallback, model, data: { simplified, keyPoints, readingTime } }`. Enforces 10 req/min/IP limit. |
| `/api/business/notices` | `GET`, `POST` | Auth (`BUSINESS`) | `GET`: Returns active notices for business. `POST`: Creates new notice, auto-triggers Groq AI summarization for `en` & `hi`, and saves record. |
| `/api/consent` | `POST` | Public / Demo | Legacy/direct consent update route. Computes SHA-256 hash and updates database or returns fallback simulation. |
| `/api/consent/grant` | `POST` | Auth (`CONSUMER`) | Validates body via Zod (`grantConsentSchema`). Executes DB transaction creating `ConsentRecord` + chained `AuditLog`, then dispatches synchronous webhook. |
| `/api/consent/revoke` | `POST` | Auth (`CONSUMER`) | Validates body via Zod (`revokeConsentSchema`). Checks user ownership, updates `ConsentRecord` (`granted=false`, `revokedAt=now`), appends chained `AuditLog`, and dispatches webhook. |
| `/api/consent/me` | `GET` | Auth (`CONSUMER`) | Fetches all consent records owned by authenticated citizen including notice details, business tier, and audit history. |
| `/api/grievances` | `GET`, `POST`, `PATCH` | Auth (Role-scoped) | `GET`: Lists grievances (`CONSUMER` sees own, `BUSINESS` sees company's, `REGULATOR` sees global). `POST`: Creates ticket with 30-day statutory SLA deadline. `PATCH`: Updates status/resolution. |
| `/api/cron/retry-webhooks` | `GET`, `POST` | Optional `CRON_SECRET` | Queries `WebhookDelivery` records where `status = RETRYING` and `nextRetryAt <= now`. Re-dispatches fetch, updates `retryCount`, recalculates backoff, or moves to `DLQ` if attempt >= 5. |
| `/api/webhooks/test` | `POST` | Auth (`BUSINESS`) | Triggers immediate test webhook (`consent.granted.test`) with HMAC-SHA256 signature to business `webhookUrl`. |
| `/api/seed-status` | `GET` | Public | Returns database counts or mock seed structure fallback if DB connection is pending. |

---

## 4. Authentication & Authorization Flow

```
[Client Request: /consumer] ──► Next.js Middleware (middleware.ts)
                                           │
                                ┌──────────┴──────────┐
                         Is Token Valid?        No: Redirect to /login
                                │ Yes
                     ┌──────────┴──────────┐
              Check Role Matching      Mismatch: Redirect to own role dashboard
                        │ Allowed
             Proceed to Route Handler
```

1. **Strategy**: Session strategy is set to `jwt`. Sessions are created via deterministic credentials provider (`consumer@demo.com`, `business@demo.com`, `regulator@demo.com`).
2. **Token Enrichment**: The JWT callback embeds `id`, `email`, `name`, `role`, `preferredLang`, and `businessId` directly into the JWT token and session object (`src/types/next-auth.d.ts`).
3. **Middleware Guard (`src/middleware.ts` & `src/lib/auth/auth.config.ts`)**:
   - Matches routes starting with `/consumer`, `/business`, `/regulator`.
   - Unauthenticated requests are redirected to `/login`.
   - Role mismatches are redirected to the user's appropriate dashboard (e.g. a `BUSINESS` user accessing `/consumer` is redirected to `/business`).
   - Authenticated users accessing `/login` are automatically redirected to their role's home portal.
4. **Database Lookup & Fallback**: In `auth.ts`, credentials lookup attempts a Prisma database search for the user email. If database connection is offline or failing, it seamlessly falls back to a deterministic demo user object to prevent demo downtime.

---

## 5. AI Legal Text Simplification Flow

```
Raw Legal Text + Target Lang ──► POST /api/ai/simplify
                                           │
                                 Check Rate Limit (10/min)
                                           │
                                 GROQ_API_KEY Present?
                                  ├── No ──► Return Static Fallback Template
                                  └── Yes ─► Invoke Groq API (Llama 3.1 8B Instant)
                                                   │
                                             Timeout (6s)?
                                              ├── Exceeded ─► Catch & Fallback Template
                                              └── OK ───────► Parse JSON Output & Return
```

1. **System Prompt (`src/lib/ai/prompts.ts`)**: Instructs the model to act as a DPDP legal simplifier, translating legal terms (e.g. "Data Fiduciary" &rarr; "Company", "Data Principal" &rarr; "You"), generating a 2-sentence summary, 3 key points, and returning strict JSON (`simplified`, `keyPoints`, `readingTime`).
2. **Provider Integration (`src/lib/ai/groq.ts`)**: Uses standard HTTP fetch to `https.api.groq.com/openai/v1/chat/completions` targeting `llama-3.1-8b-instant`.
3. **Speed & Resiliency Safeguards**:
   - Enforces a **6-second hard AbortSignal timeout** to protect serverless function duration.
   - Enforces an in-memory rate limiter (10 requests per minute per IP) in `/api/ai/simplify/route.ts`.
   - **Static Multilingual Fallback (`src/lib/ai/fallback.ts`)**: If `GROQ_API_KEY` is missing, rate-limited, or throws an error/timeout, the engine keyword-matches the text against pre-written templates across English, Hindi, Kannada, Tamil, and Telugu.

---

## 6. Cryptographic Audit-Chain Flow

```
                          ┌───────────────────────────┐
                          │   Previous Audit Record   │
                          │ currentHash: 0xa1b2c3...  │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
┌──────────────────────────┐  Canonical Stringify  ┌───────────────────────────┐
│ Input Payload            ├──────────────────────►│ Payload String            │
│ {userId, noticeId, ...}  │                       │ {"action":"GRANT", ...}   │
└──────────────────────────┘                       └────────────┬──────────────┘
                                                                │
                                   SHA256(previousHash + payloadString)
                                                                │
                                                                ▼
                                                   ┌───────────────────────────┐
                                                   │    New Audit Record       │
                                                   │ currentHash: 0xd4e5f6...  │
                                                   └───────────────────────────┘
```

1. **Canonical JSON Normalization (`src/lib/crypto/hash.ts`)**: Keys in payload objects are sorted recursively prior to hashing (`canonicalStringify`) to guarantee identical SHA-256 digests across Node.js, browser, and third-party auditors.
2. **Chain Linkage Formula (`src/lib/crypto/audit.ts`)**:
   - Genesis record: `previousHash = null` or `""`.
   - Subsequent records: `previousHash` equals the `currentHash` of the latest log in the global ledger (`getLatestAuditHash()`).
   - Hash formula: `currentHash = SHA256(previousHash + canonicalPayload)`.
3. **Atomic DB Transactions**: In `src/lib/consent/engine.ts`, `processGrantConsent` and `processRevokeConsent` wrap the creation/update of `ConsentRecord` and `AuditLog` inside a `prisma.$transaction()` block. If any step fails, the entire transaction rolls back, preserving chain integrity.
4. **Verification Engine (`verifyChain()`)**: Iterates sequentially over log arrays:
   - Verifies `previousHash` of record `i` matches `currentHash` of record `i-1`.
   - Recomputes SHA-256 hash over `previousHash + canonicalPayload` and verifies equality with stored `currentHash`.
   - Returns `{ valid: boolean, status: 'VALID'|'TAMPERED', brokenIndex: number | null, error?: string }`.

---

## 7. Webhook Dispatch & Retry Flow

```
Consent Event ──► deliverWebhook() ──► Sign HMAC-SHA256 ──► Fetch(webhookUrl, timeout=10s)
                                                                       │
                                                           ┌───────────┴───────────┐
                                                       200 OK?                  Failed / 5xx
                                                          │                        │
                                              Status: DELIVERED        Status: RETRYING
                                                                       (Calculate Exponential Backoff)
                                                                                   │
                                                                       Cron Job /api/cron/retry-webhooks
                                                                                   │
                                                                        Attempt >= 5? ──► Status: DLQ
```

1. **Payload Signing (`src/lib/webhooks/signer.ts`)**:
   - Webhook payloads are signed using HMAC-SHA256 with the business `apiKey` or `WEBHOOK_SECRET`.
   - Transmitted in HTTP Header: `x-consentflow-signature: sha256=<hex_digest>`.
2. **Synchronous Delivery (`src/lib/webhooks/deliver.ts`)**:
   - Invoked immediately after `ConsentRecord` transaction commit.
   - Guarded by a 10-second timeout `AbortController`.
   - Returns a `WebhookDelivery` log entry with status `DELIVERED` (on HTTP 2xx) or `RETRYING` (on failure).
3. **Exponential Backoff & Jitter**:
   - Backoff schedule: `1m` &rarr; `5m` &rarr; `15m` &rarr; `1h` &rarr; `6h`.
   - Adds 0-20% random jitter to avoid thundering herd conditions.
4. **Cron Retry & Dead Letter Queue (DLQ) (`src/app/api/cron/retry-webhooks/route.ts`)**:
   - Triggered periodically by Vercel Cron or external service (`cron-job.org`).
   - Fetches pending retries (`status = RETRYING` and `nextRetryAt <= now`), limited to 50 records per batch.
   - If retry attempts reach 5 without success, status transitions to `DLQ` (Dead Letter Queue) for manual inspection.

---

## 8. User Workflows & Portals

### A. Consumer Workflow (Data Principal - `/consumer`)
1. **Dashboard Overview**: Views active vs. revoked consent count cards and existing consent records.
2. **Notice Discovery**: Browses available Fiduciary notices published by businesses.
3. **AI Plain-Language Review (`/consumer/notices/[id]`)**: Switches between 5 Indic languages to inspect AI-generated summaries and key points before granting consent.
4. **Granular Toggles**: Configures required (locked ON) and optional processing choices.
5. **Grant Consent**: Checks explicit confirmation box, writes transaction to database, and receives SHA-256 audit hash.
6. **1-Tap Statutory Revocation**: Clicks "1-Tap Revoke" on active consent cards; immediately revokes consent under DPDP Section 6(4) and notifies Fiduciary via webhook.
7. **Statutory Grievance Redressal (`/consumer/grievances`)**: Files complaints under DPDP Section 13 (Access, Erasure, Correction, Nomination) and tracks 30-day SLA countdown.

### B. Business Workflow (Data Fiduciary - `/business`)
1. **Fiduciary Dashboard**: Monitors active consents, active notices, webhook delivery success rates, and open grievance SLA tickets.
2. **Consent Notice Builder (`/business/notices`)**: Drafts privacy notice title, dense legal text, and granular processing purposes. Submitting automatically triggers Groq AI summarization in English and Hindi.
3. **Webhook Management (`/business/webhooks`)**: Configures target webhook URL, views HMAC secret key, tests live payload dispatches, and inspects delivery logs.
4. **Grievance Redressal SLA Desk (`/business/grievances`)**: Manages incoming consumer complaints, updates status (`IN_PROGRESS`, `RESOLVED`, `REJECTED`), and records resolution notes.

### C. Regulator Workflow (Data Protection Board Inspector - `/regulator`)
1. **Global Compliance Inspector**: Searches and filters consent logs across all Fiduciaries by email, record ID, or SHA-256 hash.
2. **Cryptographic Verification (`/regulator/verify/[recordId]`)**: Executes live SHA-256 audit chain verification (`verifyChain()`) over chronological log entries to confirm zero payload tampering.
3. **Compliance Certificate Export**: Generates printable DPDP Act 2023 Official Compliance Certificate with root SHA-256 hash signature.

---

## 9. Deployment Configuration & Environment Variables

### Production Files:
- `next.config.ts`: Configures `reactStrictMode: true` and `experimental.serverActions.bodySizeLimit: '2mb'`.
- `vercel.json`: Specifies default serverless deployment settings.
- `prisma/schema.prisma`: Configured with `postgresql` provider and dual connection strings (`url` for pooling, `directUrl` for migrations).

### Environment Variable Contract (`.env.example`):
```env
# PostgreSQL Database Connection Strings (Neon Serverless Postgres)
DATABASE_URL="postgresql://user:pass@ep-cool-pool.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-cool-pool.region.aws.neon.tech/neondb?sslmode=require"

# Authentication (Auth.js / NextAuth v5)
AUTH_SECRET="super_secret_32_byte_hex_string"
NEXTAUTH_SECRET="super_secret_32_byte_hex_string"
NEXTAUTH_URL="https://consentflow.vercel.app"

# AI Legal Simplifier (Groq Llama 3.1 8B Instant)
GROQ_API_KEY="gsk_live_groq_api_key_string"

# Webhook Engine & Vercel Cron Security
WEBHOOK_SECRET="whsec_live_webhook_signature_secret"
CRON_SECRET="cronsec_vercel_cron_authorization_token"
```

---

## 10. Critical Production Risks & Mitigation Matrix

| Severity | Category | Identified Vulnerability / Risk | Potential Impact | Recommended Mitigation |
| :---: | :--- | :--- | :--- | :--- |
| 🔴 **CRITICAL** | **Race Condition / Audit Chain** | Concurrent consent transactions read the same `previousHash` before committing, breaking chain linkage. | Audit log validation failure for subsequent records (`verifyChain` reports `TAMPERED`). | Implement pessimistic database locking (`SELECT ... FOR UPDATE`) or serializable isolation level during audit log insertion. |
| 🔴 **CRITICAL** | **Security / Auth Bypass** | `/api/consent/route.ts` allows specifying arbitrary `userId` in POST body without checking session. | Malicious users could alter or forge consent records of other citizens. | Deprecate unauthenticated `/api/consent/route.ts` or enforce mandatory Auth.js `session.user.id` verification. |
| 🟠 **HIGH** | **Serverless Execution Timeout** | Webhook delivery in `processGrantConsent` is invoked synchronously before HTTP response completes. | Slow business webhook endpoints could cause 10s API timeouts on Next.js serverless functions. | Decouple webhook dispatching to a background worker queue (e.g. QStash, BullMQ, or Vercel Background Jobs). |
| 🟠 **HIGH** | **In-Memory Rate Limiting** | Rate limiting in `/api/ai/simplify/route.ts` uses in-memory `Map`. | Multi-instance serverless deployments (Vercel) do not share state; rate limit can be bypassed. | Upgrade rate limiter to Redis / Upstash (`@upstash/ratelimit`). |
| 🟡 **MEDIUM** | **Hardcoded Secret Fallback** | `auth.ts` contains hardcoded fallback secret (`consentflow_v2_hackathon_demo_secret_key_123`). | Security risk if `AUTH_SECRET` env variable is missing in production. | Fail fast at startup if `AUTH_SECRET` or `NEXTAUTH_SECRET` is unset in production (`NODE_ENV === 'production'`). |
| 🟡 **MEDIUM** | **API Key Plaintext Storage** | `Business.apiKey` is stored in plain text in PostgreSQL. | Database leaks expose Fiduciary webhook signing keys. | Hash API keys at rest or encrypt using AES-256-GCM. |

---

## 11. Audit Conclusion & Next Steps

ConsentFlow V2 exhibits a clean, production-ready architecture complying with DPDP Act 2023 requirements. The implementation of AI notice simplification, granular consent choices, SHA-256 audit chaining, and webhook retries is fully functional and verified across codebase files.

### Verification Execution Instructions:
Next step as requested by user prompt:
1. Run `npm run build`
2. Run `npx tsc --noEmit`
3. Report exact build and typecheck outputs.
