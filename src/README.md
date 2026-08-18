# ConsentFlow

### Intelligent Consent Management Platform for India's DPDP Act 2023

ConsentFlow is a production-style intelligent consent management platform designed to give individuals transparent control over their personal data while helping Data Fiduciaries manage consent, compliance, auditability, and grievance workflows.

## Problem

Traditional consent systems often present users with lengthy legal notices that are difficult to understand. They also lack transparent revocation mechanisms, reliable audit trails, and streamlined compliance workflows.

ConsentFlow addresses these problems through:

- AI-powered legal notice simplification
- Multilingual consent support
- Granular consent management
- One-tap consent revocation
- Tamper-evident SHA-256 audit chains
- HMAC-secured webhook notifications
- Regulatory audit and verification
- DPDP grievance management with SLA tracking

## Key Features

### Consumer Portal
- View active and revoked consents
- Read AI-simplified legal notices
- English, Hindi, Kannada, Tamil and Telugu support
- Granular purpose selection
- Explicit consent confirmation
- One-tap consent withdrawal
- Grievance filing and SLA tracking

### Business / Data Fiduciary Portal
- Consent notice creation
- AI-powered notice simplification
- Consent monitoring
- Webhook configuration and testing
- Webhook delivery logs
- Grievance resolution dashboard
- Compliance statistics

### Regulator Portal
- Search consent records
- Search by record ID, email, fiduciary or hash
- Verify complete SHA-256 audit chains
- Detect tampering at a specific audit-chain index
- Generate compliance verification certificates

## AI Legal Notice Simplification

ConsentFlow uses Groq-hosted Llama 3.1 8B Instant to convert complex legal notices into simpler language.

Supported languages:

- English
- Hindi
- Kannada
- Tamil
- Telugu

A static fallback mechanism ensures the application can continue providing simplified notices even when the AI service is unavailable.

## Cryptographic Audit Trail

Every important consent action is recorded in a chained SHA-256 audit structure.

Each audit record contains:

- Previous hash
- Current hash
- Canonical payload
- Action
- Actor
- Timestamp

This allows regulators to verify whether the historical audit trail has been modified.

## Consent Lifecycle

```text
Notice Creation
      ↓
AI Legal Simplification
      ↓
User Reviews Notice
      ↓
Granular Purpose Selection
      ↓
Explicit Consent
      ↓
SHA-256 Audit Chain
      ↓
HMAC Webhook
      ↓
Consent Revocation
      ↓
Regulator Verification