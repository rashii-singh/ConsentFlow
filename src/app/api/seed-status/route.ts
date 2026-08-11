import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fallback seed data in case database URL is not yet connected
const mockSeedData = {
  businesses: [
    {
      id: 'biz_01',
      name: 'HealthPlus Care',
      domain: 'healthplus.in',
      industry: 'Healthcare & Telemedicine',
      registrationNo: 'DPDP-BIZ-HLT-001',
      contactEmail: 'privacy@healthplus.in',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'biz_02',
      name: 'ShopSmart Retail',
      domain: 'shopsmart.co.in',
      industry: 'E-Commerce & Retail',
      registrationNo: 'DPDP-BIZ-RET-002',
      contactEmail: 'compliance@shopsmart.co.in',
      createdAt: new Date().toISOString(),
    },
  ],
  users: [
    {
      id: 'usr_consumer',
      email: 'consumer@demo.com',
      name: 'Ananya Sharma',
      role: 'CONSUMER',
      phoneNumber: '+91 98765 43210',
    },
    {
      id: 'usr_business',
      email: 'business@demo.com',
      name: 'Vikram Mehta',
      role: 'BUSINESS',
      phoneNumber: '+91 98123 45678',
      businessId: 'biz_01',
    },
    {
      id: 'usr_regulator',
      email: 'regulator@demo.com',
      name: 'Data Protection Authority India',
      role: 'REGULATOR',
      phoneNumber: '+91 11 2345 6789',
    },
  ],
  notices: [
    {
      id: 'notice_01',
      title: 'Electronic Health Record Sharing & Tele-Consultation Consent',
      description: 'Allows HealthPlus Care to securely access your medical history, diagnostic reports, and issue digital prescriptions during online consultations.',
      purpose: 'Medical Diagnosis & Prescription Processing',
      dataTypes: ['Health History', 'Prescription Records', 'Contact Phone', 'Emergency Contact'],
      version: '1.2',
      isActive: true,
      businessId: 'biz_01',
    },
    {
      id: 'notice_02',
      title: 'Personalized Shopping Recommendations & Activity Tracking',
      description: 'Allows ShopSmart Retail to analyze purchase history and browsing activity to provide tailored product suggestions and special discounts.',
      purpose: 'Personalization & Marketing Analytics',
      dataTypes: ['Browsing History', 'Purchase Category', 'Approximate Location'],
      version: '2.0',
      isActive: true,
      businessId: 'biz_02',
    },
    {
      id: 'notice_03',
      title: 'Identity Verification & Financial Gateway Consent',
      description: 'Required for processing high-value transactions, validating identity against national databases, and preventing fraudulent orders.',
      purpose: 'KYC Verification & Anti-Fraud Compliance',
      dataTypes: ['PAN Card Number', 'Billing Address', 'Payment Gateway Log'],
      version: '1.0',
      isActive: true,
      businessId: 'biz_02',
    },
  ],
  consentRecords: [
    {
      id: 'rec_01',
      userId: 'usr_consumer',
      userName: 'Ananya Sharma',
      userEmail: 'consumer@demo.com',
      noticeId: 'notice_01',
      noticeTitle: 'Electronic Health Record Sharing & Tele-Consultation Consent',
      businessId: 'biz_01',
      businessName: 'HealthPlus Care',
      status: 'GRANTED',
      dataTypesShared: ['Health History', 'Prescription Records', 'Contact Phone'],
      grantedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      revokedAt: null,
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      auditLogs: [
        {
          id: 'log_01',
          action: 'GRANT',
          timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
          previousHash: 'GENESIS_HASH',
          currentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          metadata: '{"ip":"103.21.124.5","userAgent":"ConsentFlow-Mobile/1.0"}',
        },
      ],
    },
    {
      id: 'rec_02',
      userId: 'usr_consumer',
      userName: 'Ananya Sharma',
      userEmail: 'consumer@demo.com',
      noticeId: 'notice_02',
      noticeTitle: 'Personalized Shopping Recommendations & Activity Tracking',
      businessId: 'biz_02',
      businessName: 'ShopSmart Retail',
      status: 'GRANTED',
      dataTypesShared: ['Browsing History', 'Purchase Category'],
      grantedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      revokedAt: null,
      hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      auditLogs: [
        {
          id: 'log_02',
          action: 'GRANT',
          timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
          previousHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          currentHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
          metadata: '{"ip":"103.21.124.5","userAgent":"ConsentFlow-Web/2.1"}',
        },
      ],
    },
    {
      id: 'rec_03',
      userId: 'usr_consumer',
      userName: 'Ananya Sharma',
      userEmail: 'consumer@demo.com',
      noticeId: 'notice_03',
      noticeTitle: 'Identity Verification & Financial Gateway Consent',
      businessId: 'biz_02',
      businessName: 'ShopSmart Retail',
      status: 'REVOKED',
      dataTypesShared: [],
      grantedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      revokedAt: new Date().toISOString(),
      hash: '96cae35ce8a9b0244178bf28e4966c2ce1b8385723a96a6b838858cdd6ca0a1e',
      auditLogs: [
        {
          id: 'log_03_a',
          action: 'GRANT',
          timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
          previousHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
          currentHash: 'a716c5b96781290374e62a11b6218d6a45b91b87a059',
          metadata: '{"reason":"Initial Grant"}',
        },
        {
          id: 'log_03_b',
          action: 'REVOKE',
          timestamp: new Date().toISOString(),
          previousHash: 'a716c5b96781290374e62a11b6218d6a45b91b87a059',
          currentHash: '96cae35ce8a9b0244178bf28e4966c2ce1b8385723a96a6b838858cdd6ca0a1e',
          metadata: '{"reason":"User requested DPDP Section 6(4) Revocation"}',
        },
      ],
    },
    {
      id: 'rec_04',
      userId: 'usr_business',
      userName: 'Vikram Mehta',
      userEmail: 'business@demo.com',
      noticeId: 'notice_01',
      noticeTitle: 'Electronic Health Record Sharing & Tele-Consultation Consent',
      businessId: 'biz_01',
      businessName: 'HealthPlus Care',
      status: 'GRANTED',
      dataTypesShared: ['Health History', 'Contact Phone', 'Emergency Contact'],
      grantedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      revokedAt: null,
      hash: 'b10a6d83961dd3c1ac88b59b2dc327aa4e3b0c44298fc1c149afbf4c8996fb92',
      auditLogs: [
        {
          id: 'log_04',
          action: 'GRANT',
          timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
          previousHash: '96cae35ce8a9b0244178bf28e4966c2ce1b8385723a96a6b838858cdd6ca0a1e',
          currentHash: 'b10a6d83961dd3c1ac88b59b2dc327aa4e3b0c44298fc1c149afbf4c8996fb92',
          metadata: '{"ip":"122.160.42.18","source":"Portal UI"}',
        },
      ],
    },
    {
      id: 'rec_05',
      userId: 'usr_business',
      userName: 'Vikram Mehta',
      userEmail: 'business@demo.com',
      noticeId: 'notice_02',
      noticeTitle: 'Personalized Shopping Recommendations & Activity Tracking',
      businessId: 'biz_02',
      businessName: 'ShopSmart Retail',
      status: 'PENDING',
      dataTypesShared: [],
      grantedAt: new Date().toISOString(),
      revokedAt: null,
      hash: '5d41402abc4b2a76b9719d911017c592abe600f459fa30c403f00404f147b3be',
      auditLogs: [
        {
          id: 'log_05',
          action: 'INITIATE_REQUEST',
          timestamp: new Date().toISOString(),
          previousHash: 'b10a6d83961dd3c1ac88b59b2dc327aa4e3b0c44298fc1c149afbf4c8996fb92',
          currentHash: '5d41402abc4b2a76b9719d911017c592abe600f459fa30c403f00404f147b3be',
          metadata: '{"note":"Notice displayed to user, awaiting action"}',
        },
      ],
    },
  ],
};

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const businessCount = await prisma.business.count();
    const noticeCount = await prisma.consentNotice.count();
    const recordCount = await prisma.consentRecord.count();

    const businesses = await prisma.business.findMany({ include: { notices: true } });
    const users = await prisma.user.findMany();
    const notices = await prisma.consentNotice.findMany({ include: { business: true } });
    const consentRecords = await prisma.consentRecord.findMany({
      include: {
        user: true,
        notice: true,
        business: true,
        auditLogs: true,
      },
    });

    return NextResponse.json({
      source: 'database',
      counts: {
        users: userCount,
        businesses: businessCount,
        notices: noticeCount,
        consentRecords: recordCount,
      },
      data: {
        businesses,
        users,
        notices,
        consentRecords,
      },
    });
  } catch (error: any) {
    // If DB is not connected yet, return structured mock data matching seed
    return NextResponse.json({
      source: 'mock_seed',
      counts: {
        users: mockSeedData.users.length,
        businesses: mockSeedData.businesses.length,
        notices: mockSeedData.notices.length,
        consentRecords: mockSeedData.consentRecords.length,
      },
      data: mockSeedData,
      note: 'Database connection pending or offline. Displaying valid seed structure payload.',
    });
  }
}
