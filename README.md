
```markdown
# ConsentFlow

### Intelligent Consent Management Platform for India's DPDP Act 2023

> **Smarter Consent. Stronger Privacy. Verifiable Compliance.**

ConsentFlow is an intelligent consent management platform designed around the **Digital Personal Data Protection (DPDP) Act, 2023**.

It provides a unified platform for **Data Principals, Data Fiduciaries, and Regulators** to manage, understand, record, and verify the complete consent lifecycle.

---

## 🚨 The Problem

Digital consent is often reduced to a simple **"Accept"** button.

Users frequently face:

- Complex legal notices that are difficult to understand
- Lack of granular control over individual purposes
- Difficulty withdrawing consent
- Limited visibility into how consent was recorded
- Weak auditability of historical consent events
- Manual compliance verification
- Disconnected grievance management
- Unreliable communication between consent systems and business applications

Organizations, meanwhile, need reliable evidence that consent was properly obtained, maintained, and revoked.

**ConsentFlow addresses both sides of this problem.**

---

# 💡 Our Solution

ConsentFlow creates a complete digital consent lifecycle:

```text
Legal Notice
     ↓
AI Simplification
     ↓
Consumer Understanding
     ↓
Granular Purpose Selection
     ↓
Explicit Consent
     ↓
Cryptographic Audit Record
     ↓
Secure Webhook Notification
     ↓
Consent Revocation
     ↓
Updated Audit Record
     ↓
Regulator Verification
````

Instead of treating consent as a single database boolean, ConsentFlow treats it as a **verifiable lifecycle**.

---

# 👥 Three Stakeholders. One Platform.

## 👤 Data Principal / Consumer

Consumers can:

* Read privacy and consent notices
* Simplify complex legal language using AI
* View important key points
* Select individual purposes
* Provide explicit consent
* Review consent history
* Revoke consent
* File grievances
* Track grievance status and SLA

---

## 🏢 Data Fiduciary / Business

Businesses can:

* Create and manage consent notices
* Store original legal text
* Generate simplified versions
* Define granular processing purposes
* Monitor consent records
* Configure secure webhooks
* Test webhook delivery
* View webhook delivery history
* Manage consumer grievances
* Track grievance resolution

---

## ⚖️ Regulator

Regulators can:

* Search consent records
* Inspect consent history
* Inspect audit records
* Verify the cryptographic audit chain
* Detect potential tampering
* Inspect canonical payloads
* Verify individual consent records

This creates an independent verification layer rather than relying only on the organization's current database state.

---

# 🤖 AI-Powered Legal Simplification

Legal notices can be difficult for ordinary users to understand.

ConsentFlow uses **Groq + Llama 3.1 8B Instant** to transform complex legal text into a more accessible representation.

The simplification workflow provides:

* Simplified explanation
* Key points
* Reading-time information
* Multilingual support

### Supported languages

* English
* Hindi
* Kannada
* Tamil
* Telugu

ConsentFlow also includes a **fallback mechanism** so the application can continue functioning when the external AI service is unavailable.

---

# 🔐 SHA-256 Cryptographic Audit Chain

One of ConsentFlow's core features is its tamper-evident audit mechanism.

Consent actions are recorded as cryptographically linked audit entries.

```text
Audit Entry N-1
      │
      │ previousHash
      ↓
Canonical Payload
      │
      ↓
SHA-256
      │
      ↓
currentHash
      │
      ↓
Audit Entry N
```

Each entry contains a reference to the previous hash, creating a chain of audit records.

### Why SHA-256?

SHA-256 provides:

* Deterministic hashing
* Strong collision resistance
* Fixed-length 256-bit output
* Efficient computation
* Easy independent verification
* Tamper-evident chaining

If an earlier audit record or its canonical payload is modified, the resulting hash relationship can no longer match the subsequent chain.

---

# 🔎 Regulator Verification

The regulator workflow allows a consent record to be independently inspected.

```text
Consent Record
      ↓
Audit Chain
      ↓
Previous Hash
      ↓
Canonical Payload
      ↓
Recomputed Hash
      ↓
Compare With Stored Hash
      ↓
VALID / TAMPER DETECTED
```

This provides a practical mechanism for detecting inconsistencies in the audit history.

---

# 🔗 HMAC-Secured Webhooks

ConsentFlow can notify external business systems when consent events occur.

Webhook security uses **HMAC signatures** to provide message authenticity and integrity.

The webhook system includes:

* HMAC signing
* Delivery status tracking
* HTTP response tracking
* Delivery logs
* Retry handling
* Exponential backoff
* Jitter
* Dead Letter Queue handling

Example retry progression:

```text
Initial Delivery
      ↓
Retry
      ↓
1 minute
      ↓
5 minutes
      ↓
15 minutes
      ↓
1 hour
      ↓
6 hours
      ↓
Dead Letter Queue
```

This allows temporary external-service failures to be handled without immediately losing consent-event notifications.

---

# 🔄 Consent Lifecycle

ConsentFlow supports both granting and revoking consent.

### Grant

```text
Consumer
   ↓
Reviews Notice
   ↓
Selects Purposes
   ↓
Explicitly Grants Consent
   ↓
Audit Record Created
   ↓
Webhook Notification
```

### Revoke

```text
Existing Consent
   ↓
Consumer Revokes
   ↓
Consent State Updated
   ↓
Revocation Audit Record
   ↓
Webhook Notification
```

Every important consent action becomes part of the audit trail.

---

# 📝 Grievance Management

ConsentFlow includes a grievance workflow connecting consumers and businesses.

### Consumer

```text
File Grievance
      ↓
Select Category
      ↓
Submit Description
      ↓
Track Status
      ↓
Monitor SLA
```

### Business

```text
Receive Grievance
      ↓
Review
      ↓
Update Status
      ↓
Record Resolution
      ↓
Resolve
```

The system tracks the application's grievance SLA workflow and provides visibility to both sides.

---

# 🏗️ System Architecture

```text
                         CONSENTFLOW
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
     CONSUMER             BUSINESS             REGULATOR
      PORTAL                PORTAL                PORTAL
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                         NEXT.JS APIs
                              │
              ┌───────────────┼───────────────┐
              │               │               │
           GROQ AI       CONSENT ENGINE    WEBHOOKS
              │               │               │
              └───────────────┼───────────────┘
                              │
                           PRISMA
                              │
                         POSTGRESQL
                              │
                     AUDIT / HASH CHAIN
```

---

# 🛠️ Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js App Router
* Next.js API Routes
* Prisma ORM
* PostgreSQL

### AI

* Groq API
* Llama 3.1 8B Instant

### Security & Compliance

* SHA-256
* HMAC
* NextAuth
* Cryptographic audit chaining

### Infrastructure

* Serverless-compatible architecture
* PostgreSQL-compatible database
* Vercel-compatible deployment architecture
* External cron support for webhook retry processing

---

# 📂 Project Structure

```text
ConsentFlow/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   ├── auth/
│   │   │   ├── business/
│   │   │   ├── consent/
│   │   │   ├── grievances/
│   │   │   ├── webhooks/
│   │   │   └── cron/
│   │   │
│   │   ├── business/
│   │   ├── consumer/
│   │   ├── regulator/
│   │   └── login/
│   │
│   ├── components/
│   │
│   └── lib/
│       ├── ai/
│       ├── consent/
│       ├── crypto/
│       └── webhooks/
│
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
├── PRODUCTION_AUDIT.md
└── README.md
```

---

# 🌐 Application Portals

| Portal    | Purpose                                               |
| --------- | ----------------------------------------------------- |
| Consumer  | Understand and control personal-data consent          |
| Business  | Manage notices, consent infrastructure and grievances |
| Regulator | Inspect and verify consent records                    |

### Main Routes

```text
/consumer
/business
/regulator

/consumer/grievances
/consumer/notices/[id]

/business/notices
/business/grievances
/business/webhooks

/regulator/verify/[recordId]
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Node.js
* npm
* PostgreSQL database
* Groq API key

---

## 1. Clone the repository

```bash
git clone https://github.com/rashii-singh/ConsentFlow.git
cd ConsentFlow
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env.local` file using `.env.example` as the reference.

Required configuration includes:

```text
DATABASE_URL
DIRECT_URL

AUTH_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL

NEXT_PUBLIC_APP_URL

GROQ_API_KEY

WEBHOOK_SECRET
CRON_SECRET
```

**Never commit `.env` or `.env.local` to GitHub.**

---

## 4. Generate Prisma Client

```bash
npx prisma generate
```

---

## 5. Run the development server

```bash
npm run dev
```

Open:

```text
https://consent-flow-amber.vercel.app
```

---

# 🏭 Production Build

To verify the application before deployment:

```bash
npm run build
```

The production build generates the Prisma Client before running the Next.js production build.

---

# 🔒 Security Considerations

ConsentFlow follows a schema-first and security-conscious approach.

Key principles include:

* Prisma schema remains the source of truth for database models
* Secrets are stored through environment variables
* `.env` and `.env.local` are excluded from source control
* Consent events are cryptographically chained
* Webhook requests use HMAC authentication
* Webhook failures use controlled retry mechanisms
* AI simplification has a fallback mechanism
* API inputs are validated
* Regulator verification works against stored audit records

---

# 🎯 Why ConsentFlow?

Traditional consent systems often focus on:

> **"Did the user click Accept?"**

ConsentFlow focuses on a bigger question:

> **"Can the user understand what they are agreeing to, control that agreement, and can the organization later prove what happened?"**

That leads to three principles:

```text
UNDERSTAND
    ↓
CONTROL
    ↓
VERIFY
```

### Understand

AI-assisted simplification helps users comprehend complex notices.

### Control

Granular purpose selection and consent revocation give users control over their consent.

### Verify

Cryptographically chained audit records provide a mechanism for integrity verification.

---

# 🌟 Key Differentiators

| Capability                     | ConsentFlow |
| ------------------------------ | ----------- |
| AI legal simplification        | ✅           |
| Multilingual support           | ✅           |
| Granular purpose consent       | ✅           |
| Consent revocation             | ✅           |
| Cryptographic audit chain      | ✅           |
| SHA-256 verification           | ✅           |
| HMAC webhooks                  | ✅           |
| Retry + DLQ workflow           | ✅           |
| Grievance management           | ✅           |
| Consumer portal                | ✅           |
| Business portal                | ✅           |
| Regulator portal               | ✅           |
| Independent audit verification | ✅           |

---

# 📊 Complete Consent Infrastructure

ConsentFlow combines multiple technologies into one workflow:

```text
             ┌─────────────┐
             │     AI      │
             │ Understand  │
             └──────┬──────┘
                    │
                    ↓
             ┌─────────────┐
             │   CONSENT   │
             │   CONTROL   │
             └──────┬──────┘
                    │
                    ↓
             ┌─────────────┐
             │  CRYPTO     │
             │   VERIFY    │
             └──────┬──────┘
                    │
                    ↓
             ┌─────────────┐
             │  WEBHOOKS   │
             │  INTEGRATE  │
             └──────┬──────┘
                    │
                    ↓
             ┌─────────────┐
             │ REGULATOR   │
             │  INSPECT    │
             └─────────────┘
```

---

# 🏆 Project Vision

ConsentFlow aims to make privacy consent:

**Understandable for people.**

**Manageable for businesses.**

**Verifiable for regulators.**

The goal is not simply to build another consent form.

It is to build a **trust infrastructure for digital consent**.

---

## Team

Built by the **ConsentFlow Team**.

### AI • Privacy • Cryptography • Compliance

---

## License

This project was developed as a hackathon project and is intended for demonstration and educational purposes.
