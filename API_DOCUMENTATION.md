```markdown
# ConsentFlow API Documentation

ConsentFlow exposes REST-style API routes through the Next.js App Router.

## Base URL

For local development:

http://localhost:3000

For production, replace the base URL with the deployed application URL.

---

## 1. AI Legal Simplification

### POST `/api/ai/simplify`

Simplifies a legal consent notice using the AI simplification engine.

### Request

json
{
  "legalText": "Your legal consent notice text",
  "language": "hi"
}
````

### Response

Returns a simplified representation of the notice including simplified text and key points.

The application also provides a fallback mechanism when the external AI service is unavailable.

---

## 2. Business Consent Notices

### GET `/api/business/notices`

Retrieves consent notices associated with the authenticated business.

### POST `/api/business/notices`

Creates a new consent notice.

### Request

```json
{
  "title": "Electronic Health Record Sharing Consent",
  "rawLegalText": "Original legal notice text",
  "purposes": [
    "Health record sharing",
    "Tele-consultation"
  ]
}
```

---

## 3. Consent Management

### POST `/api/consent`

Creates a consent action and records the corresponding cryptographic audit entry.

The audit record contains:

* Action
* Actor
* Previous hash
* Current SHA-256 hash
* Canonical payload
* Timestamp

---

### POST `/api/consent/grant`

Grants consent for the selected purposes.

The operation:

1. Validates the consent request.
2. Creates/updates the consent record.
3. Creates a cryptographically chained audit entry.
4. Triggers the configured webhook workflow.

---

### POST `/api/consent/revoke`

Revokes an existing consent.

The operation:

1. Updates the consent state.
2. Creates a `REVOKE` audit entry.
3. Links the entry to the previous audit hash.
4. Triggers the webhook workflow.

---

### GET `/api/consent/me`

Returns the authenticated consumer's consent records.

---

## 4. Grievance Management

### GET `/api/grievances`

Retrieves grievances according to the authenticated user's role.

### POST `/api/grievances`

Creates a new grievance.

Supported grievance types:

* `ACCESS`
* `ERASURE`
* `CORRECTION`
* `NOMINATION`

### PATCH `/api/grievances`

Updates the status and resolution information for a grievance.

Supported statuses include:

* `OPEN`
* `IN_PROGRESS`
* `RESOLVED`
* `REJECTED`

The system maintains the configured SLA deadline for grievance resolution.

---

## 5. Webhook Testing

### POST `/api/webhooks/test`

Tests delivery of a configured webhook endpoint.

Webhook requests use HMAC-based signatures for message authenticity and integrity.

---

## 6. Webhook Retry Processing

### GET `/api/cron/retry-webhooks`

Processes pending webhook deliveries and retries failed deliveries according to the configured retry strategy.

The endpoint is intended to be triggered by a scheduled job or external cron service.

---

## 7. Authentication

### `/api/auth/[...nextauth]`

Handles authentication through NextAuth.

Authentication-related secrets must be configured through environment variables.

---

## 8. Seed Status

### GET `/api/seed-status`

Returns the current status of application seed/demo data.

---

## Security

API routes use server-side environment variables for sensitive configuration.

Required secrets include:

* `DATABASE_URL`
* `DIRECT_URL`
* `AUTH_SECRET`
* `NEXTAUTH_SECRET`
* `GROQ_API_KEY`
* `WEBHOOK_SECRET`
* `CRON_SECRET`

Secrets must never be committed to the repository.

---

## Cryptographic Audit Model

Consent events are stored using a tamper-evident SHA-256 hash chain.

Conceptually:

```text
Previous Audit Hash
        ↓
Canonical Payload
        ↓
SHA-256
        ↓
Current Audit Hash
```

The regulator portal can recompute and verify the chain to detect modifications to historical audit records.

---

## Main API Groups

| API Group          | Purpose                            |
| ------------------ | ---------------------------------- |
| `/api/ai/*`        | AI legal simplification            |
| `/api/consent/*`   | Grant, revoke and retrieve consent |
| `/api/business/*`  | Business notice management         |
| `/api/grievances`  | Grievance filing and resolution    |
| `/api/webhooks/*`  | Webhook testing                    |
| `/api/cron/*`      | Webhook retry processing           |
| `/api/auth/*`      | Authentication                     |
| `/api/seed-status` | Demo/seed status                   |

