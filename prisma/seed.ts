import {
  PrismaClient,
  UserRole,
  BusinessTier,
  ConsentAction,
  GrievanceType,
  GrievanceStatus,
  WebhookStatus,
} from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function computeSha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function main() {
  console.log('🌱 Starting ConsentFlow V2 Database Seeding...');

  // Clean existing records in reverse dependency order
  await prisma.webhookDelivery.deleteMany();
  await prisma.grievanceTicket.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.consentNotice.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 1. Create 3 Demo Users
  const consumerUser = await prisma.user.create({
    data: {
      email: 'consumer@demo.com',
      name: 'Ananya Sharma',
      role: UserRole.CONSUMER,
      preferredLang: 'hi',
    },
  });

  const businessUser = await prisma.user.create({
    data: {
      email: 'business@demo.com',
      name: 'Vikram Mehta',
      role: UserRole.BUSINESS,
      preferredLang: 'en',
    },
  });

  const regulatorUser = await prisma.user.create({
    data: {
      email: 'regulator@demo.com',
      name: 'Data Protection Authority Officer',
      role: UserRole.REGULATOR,
      preferredLang: 'en',
    },
  });

  console.log(`✅ Seeded 3 Demo Users:
  - Consumer: ${consumerUser.email}
  - Business: ${businessUser.email}
  - Regulator: ${regulatorUser.email}`);

  // 2. Create 2 Businesses
  const healthPlus = await prisma.business.create({
    data: {
      name: 'HealthPlus Care',
      userId: businessUser.id,
      webhookUrl: 'https://webhook.site/demo-healthplus-dpdp-endpoint',
      apiKey: 'cf_live_hp_' + crypto.randomBytes(16).toString('hex'),
      tier: BusinessTier.ENTERPRISE,
    },
  });

  const shopSmart = await prisma.business.create({
    data: {
      name: 'ShopSmart Retail',
      webhookUrl: 'https://webhook.site/demo-shopsmart-dpdp-endpoint',
      apiKey: 'cf_live_ss_' + crypto.randomBytes(16).toString('hex'),
      tier: BusinessTier.GROWTH,
    },
  });

  console.log(`✅ Seeded 2 Businesses: ${healthPlus.name} (${healthPlus.tier}), ${shopSmart.name} (${shopSmart.tier})`);

  // 3. Create 3 Consent Notices
  const notice1 = await prisma.consentNotice.create({
    data: {
      businessId: healthPlus.id,
      title: 'Electronic Health Record Sharing & Tele-Consultation Notice',
      rawLegalText: 'HealthPlus Care collects and processes personal health data, diagnostic history, and prescription notes to facilitate remote doctor consultations and digital health monitoring pursuant to Section 6 of DPDP Act 2023.',
      simplifiedVersions: {
        en: {
          simplified: 'We access your health records and diagnostic reports so doctors can diagnose you remotely.',
          keyPoints: ['Access health history', 'Share prescriptions with pharmacies', 'Emergency doctor access'],
          readingTime: '45s',
        },
        hi: {
          simplified: 'हम आपकी स्वास्थ्य जानकारी का उपयोग ऑनलाइन डॉक्टर सलाह और डिजिटल पर्चे देने के लिए करते हैं।',
          keyPoints: ['स्वास्थ्य इतिहास तक पहुंच', 'फार्मेसी के साथ पर्चा साझा करना', 'आपातकालीन सहायता'],
          readingTime: '45s',
        },
      },
      purposes: [
        { id: 'p_medical_diagnosis', name: 'Medical Diagnosis & Consultation', required: true, defaultOn: true },
        { id: 'p_prescription_sharing', name: 'Pharmacy Prescription Fulfillment', required: false, defaultOn: false },
        { id: 'p_health_analytics', name: 'Anonymized Health Trend Research', required: false, defaultOn: false },
      ],
      isActive: true,
    },
  });

  const notice2 = await prisma.consentNotice.create({
    data: {
      businessId: shopSmart.id,
      title: 'Personalized Shopping Recommendations & Activity Tracking Notice',
      rawLegalText: 'ShopSmart Retail tracks product viewing patterns, item search terms, and approximate device locations to personalize discount offers and product recommendations.',
      simplifiedVersions: {
        en: {
          simplified: 'We track items you view to show customized deals and products you like.',
          keyPoints: ['Tailored store discounts', 'Browsing history retention for 90 days', 'Optional location deals'],
          readingTime: '30s',
        },
      },
      purposes: [
        { id: 'p_order_processing', name: 'Order Fulfill & Delivery', required: true, defaultOn: true },
        { id: 'p_personalized_offers', name: 'Personalized Product Discounts', required: false, defaultOn: true },
        { id: 'p_browsing_analytics', name: 'Browsing Analytics & Ad Metrics', required: false, defaultOn: false },
      ],
      isActive: true,
    },
  });

  const notice3 = await prisma.consentNotice.create({
    data: {
      businessId: shopSmart.id,
      title: 'Identity Verification & Anti-Fraud Consent Notice',
      rawLegalText: 'ShopSmart Retail verifies government photo ID documents and banking credentials against national databases to prevent fraud on high-value retail orders.',
      simplifiedVersions: {
        en: {
          simplified: 'We verify your identity to prevent payment fraud on high-value purchases.',
          keyPoints: ['One-time identity verification', 'Encrypted database check', 'No identity selling'],
          readingTime: '35s',
        },
      },
      purposes: [
        { id: 'p_kyc_validation', name: 'Identity & Fraud Prevention', required: true, defaultOn: true },
        { id: 'p_credit_check', name: 'Instant EMI Eligibility Verification', required: false, defaultOn: false },
      ],
      isActive: true,
    },
  });

  console.log(`✅ Seeded 3 Consent Notices across businesses.`);

  // 4. Create 5 Consent Records with SHA-256 Audit Chains
  const tenDaysAgo = new Date(Date.now() - 10 * 86400000);
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000);
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
  const now = new Date();

  // Record 1: Consumer -> HealthPlus (Notice 1) GRANTED
  const payload1 = {
    userId: consumerUser.id,
    noticeId: notice1.id,
    businessId: healthPlus.id,
    granted: true,
    choices: { p_medical_diagnosis: true, p_prescription_sharing: true, p_health_analytics: false },
    timestamp: tenDaysAgo.toISOString(),
  };
  const genesisHash1 = computeSha256(JSON.stringify(payload1));

  const record1 = await prisma.consentRecord.create({
    data: {
      userId: consumerUser.id,
      noticeId: notice1.id,
      businessId: healthPlus.id,
      granted: true,
      choices: payload1.choices,
      ipAddress: '103.21.124.5',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
      createdAt: tenDaysAgo,
      auditLogs: {
        create: {
          action: ConsentAction.GRANT,
          actorId: consumerUser.id,
          previousHash: null, // Genesis
          currentHash: genesisHash1,
          payload: payload1,
          timestamp: tenDaysAgo,
        },
      },
    },
  });

  // Record 2: Consumer -> ShopSmart (Notice 2) GRANTED
  const payload2 = {
    userId: consumerUser.id,
    noticeId: notice2.id,
    businessId: shopSmart.id,
    granted: true,
    choices: { p_order_processing: true, p_personalized_offers: true, p_browsing_analytics: false },
    timestamp: fiveDaysAgo.toISOString(),
  };
  const hash2 = computeSha256(genesisHash1 + JSON.stringify(payload2));

  const record2 = await prisma.consentRecord.create({
    data: {
      userId: consumerUser.id,
      noticeId: notice2.id,
      businessId: shopSmart.id,
      granted: true,
      choices: payload2.choices,
      ipAddress: '103.21.124.5',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
      createdAt: fiveDaysAgo,
      auditLogs: {
        create: {
          action: ConsentAction.GRANT,
          actorId: consumerUser.id,
          previousHash: genesisHash1,
          currentHash: hash2,
          payload: payload2,
          timestamp: fiveDaysAgo,
        },
      },
    },
  });

  // Record 3: Consumer -> ShopSmart (Notice 3) REVOKED
  const initialPayload3 = {
    userId: consumerUser.id,
    noticeId: notice3.id,
    businessId: shopSmart.id,
    granted: true,
    choices: { p_kyc_validation: true, p_credit_check: true },
    timestamp: tenDaysAgo.toISOString(),
  };
  const hash3a = computeSha256(hash2 + JSON.stringify(initialPayload3));

  const revokePayload3 = {
    userId: consumerUser.id,
    noticeId: notice3.id,
    businessId: shopSmart.id,
    granted: false,
    choices: { p_kyc_validation: true, p_credit_check: false },
    timestamp: twoDaysAgo.toISOString(),
  };
  const hash3b = computeSha256(hash3a + JSON.stringify(revokePayload3));

  const record3 = await prisma.consentRecord.create({
    data: {
      userId: consumerUser.id,
      noticeId: notice3.id,
      businessId: shopSmart.id,
      granted: false,
      choices: revokePayload3.choices,
      ipAddress: '103.21.124.5',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
      createdAt: tenDaysAgo,
      revokedAt: twoDaysAgo,
      auditLogs: {
        createMany: {
          data: [
            {
              action: ConsentAction.GRANT,
              actorId: consumerUser.id,
              previousHash: hash2,
              currentHash: hash3a,
              payload: initialPayload3,
              timestamp: tenDaysAgo,
            },
            {
              action: ConsentAction.REVOKE,
              actorId: consumerUser.id,
              previousHash: hash3a,
              currentHash: hash3b,
              payload: revokePayload3,
              timestamp: twoDaysAgo,
            },
          ],
        },
      },
    },
  });

  // Record 4: Business User -> HealthPlus (Notice 1) GRANTED
  const payload4 = {
    userId: businessUser.id,
    noticeId: notice1.id,
    businessId: healthPlus.id,
    granted: true,
    choices: { p_medical_diagnosis: true, p_prescription_sharing: false },
    timestamp: fiveDaysAgo.toISOString(),
  };
  const hash4 = computeSha256(hash3b + JSON.stringify(payload4));

  const record4 = await prisma.consentRecord.create({
    data: {
      userId: businessUser.id,
      noticeId: notice1.id,
      businessId: healthPlus.id,
      granted: true,
      choices: payload4.choices,
      ipAddress: '122.160.42.18',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      createdAt: fiveDaysAgo,
      auditLogs: {
        create: {
          action: ConsentAction.GRANT,
          actorId: businessUser.id,
          previousHash: hash3b,
          currentHash: hash4,
          payload: payload4,
          timestamp: fiveDaysAgo,
        },
      },
    },
  });

  // Record 5: Business User -> ShopSmart (Notice 2) REVOKED
  const payload5 = {
    userId: businessUser.id,
    noticeId: notice2.id,
    businessId: shopSmart.id,
    granted: false,
    choices: { p_order_processing: true, p_personalized_offers: false },
    timestamp: now.toISOString(),
  };
  const hash5 = computeSha256(hash4 + JSON.stringify(payload5));

  const record5 = await prisma.consentRecord.create({
    data: {
      userId: businessUser.id,
      noticeId: notice2.id,
      businessId: shopSmart.id,
      granted: false,
      choices: payload5.choices,
      ipAddress: '122.160.42.18',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      createdAt: twoDaysAgo,
      revokedAt: now,
      auditLogs: {
        create: {
          action: ConsentAction.REVOKE,
          actorId: businessUser.id,
          previousHash: hash4,
          currentHash: hash5,
          payload: payload5,
          timestamp: now,
        },
      },
    },
  });

  console.log(`✅ Seeded 5 Consent Records with cryptographic audit chains:
  - Record 1 (${record1.id}): GRANTED
  - Record 2 (${record2.id}): GRANTED
  - Record 3 (${record3.id}): REVOKED
  - Record 4 (${record4.id}): GRANTED
  - Record 5 (${record5.id}): REVOKED`);

  // 5. Create Realistic V2 Grievance Tickets (30-day SLA)
  const slaDeadline1 = new Date(Date.now() + 25 * 86400000); // 25 days remaining
  const slaDeadline2 = new Date(Date.now() + 28 * 86400000); // 28 days remaining

  const grievance1 = await prisma.grievanceTicket.create({
    data: {
      userId: consumerUser.id,
      businessId: shopSmart.id,
      type: GrievanceType.ERASURE,
      description: 'Requesting complete erasure of browsing activity logs under DPDP Section 12 right to erasure.',
      status: GrievanceStatus.IN_PROGRESS,
      slaDeadline: slaDeadline1,
      createdAt: fiveDaysAgo,
    },
  });

  const grievance2 = await prisma.grievanceTicket.create({
    data: {
      userId: consumerUser.id,
      businessId: healthPlus.id,
      type: GrievanceType.ACCESS,
      description: 'Requesting copy of all tele-consultation summary records shared with partner labs.',
      status: GrievanceStatus.OPEN,
      slaDeadline: slaDeadline2,
      createdAt: twoDaysAgo,
    },
  });

  console.log(`✅ Seeded 2 Grievance Tickets with 30-day SLA deadlines:
  - Grievance 1 (${grievance1.id}): ${grievance1.status} (${grievance1.type})
  - Grievance 2 (${grievance2.id}): ${grievance2.status} (${grievance2.type})`);

  // 6. Create Realistic V2 Webhook Delivery Logs
  const webhook1 = await prisma.webhookDelivery.create({
    data: {
      businessId: healthPlus.id,
      eventType: 'consent.granted',
      payload: { recordId: record1.id, userId: consumerUser.id, noticeId: notice1.id, choices: record1.choices },
      signature: 'sha256=' + computeSha256('healthplus_secret_' + record1.id),
      status: WebhookStatus.DELIVERED,
      responseStatus: 200,
      responseBody: '{"success":true,"message":"Webhook received and processed"}',
      retryCount: 0,
      createdAt: tenDaysAgo,
      deliveredAt: tenDaysAgo,
    },
  });

  const webhook2 = await prisma.webhookDelivery.create({
    data: {
      businessId: shopSmart.id,
      eventType: 'consent.revoked',
      payload: { recordId: record3.id, userId: consumerUser.id, noticeId: notice3.id },
      signature: 'sha256=' + computeSha256('shopsmart_secret_' + record3.id),
      status: WebhookStatus.RETRYING,
      responseStatus: 503,
      responseBody: 'Service Unavailable - Endpoint rate limited',
      retryCount: 2,
      nextRetryAt: new Date(Date.now() + 15 * 60000), // 15 mins from now
      createdAt: twoDaysAgo,
    },
  });

  console.log(`✅ Seeded 2 Webhook Delivery Logs:
  - Webhook 1 (${webhook1.id}): ${webhook1.status} (200 OK)
  - Webhook 2 (${webhook2.id}): ${webhook2.status} (Retry #2 scheduled)`);

  console.log('\n🎉 ConsentFlow V2 Database Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
