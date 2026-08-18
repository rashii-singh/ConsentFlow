import { prisma } from '@/lib/prisma';
import { hashAction } from '@/lib/crypto/audit';
import { ConsentAction } from '@prisma/client';
import { GrantConsentInput, RevokeConsentInput } from '@/lib/validators';
import { deliverWebhook } from '@/lib/webhooks/deliver';

export interface ConsentEngineResult {
  success: boolean;
  data?: {
    consentId: string;
    hash: string;
    granted: boolean;
    noticeId: string;
    businessId: string;
    createdAt?: Date;
    revokedAt?: Date | null;
  };
  error?: string;
  isForbidden?: boolean;
}

/**
 * Retrieves the latest global audit log's currentHash to maintain the system-wide
 * cryptographic hash chain SHA256((previousHash || '') + canonicalPayload).
 */
async function getLatestAuditHash(): Promise<string | null> {
  const lastLog = await prisma.auditLog.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { currentHash: true },
  });
  return lastLog?.currentHash || null;
}

/**
 * Executes a Grant Consent transaction:
 * 1. Checks notice existence & fetches businessId.
 * 2. Fetches latest audit chain hash.
 * 3. Creates ConsentRecord & chained AuditLog in an atomic database transaction.
 * 4. Synchronously dispatches webhook to business endpoint.
 */
export async function processGrantConsent(
  userId: string,
  input: GrantConsentInput
): Promise<ConsentEngineResult> {
  // Verify notice exists and is active
  const notice = await prisma.consentNotice.findUnique({
    where: { id: input.noticeId },
    select: { id: true, businessId: true, isActive: true },
  });

  if (!notice) {
    return { success: false, error: 'Consent Notice not found' };
  }

  if (!notice.isActive) {
    return { success: false, error: 'Consent Notice is currently inactive' };
  }

  // Get previous hash in global chain
  const previousHash = await getLatestAuditHash();

  const timestamp = new Date();
  const payload = {
    userId,
    noticeId: notice.id,
    businessId: notice.businessId,
    action: ConsentAction.GRANT,
    choices: input.choices,
    timestamp: timestamp.toISOString(),
  };

  const { currentHash } = hashAction(payload, previousHash);

  // Execute database transaction atomically
  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.consentRecord.create({
      data: {
        userId,
        noticeId: notice.id,
        businessId: notice.businessId,
        granted: true,
        choices: input.choices,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        createdAt: timestamp,
      },
    });

    await tx.auditLog.create({
      data: {
        recordId: record.id,
        action: ConsentAction.GRANT,
        actorId: userId,
        previousHash,
        currentHash,
        payload,
        timestamp,
      },
    });

    return record;
  });

  // Synchronous webhook delivery right after audit log is committed
  try {
    await deliverWebhook({
      businessId: notice.businessId,
      eventType: 'consent.granted',
      payload: {
        recordId: result.id,
        userId,
        noticeId: notice.id,
        choices: input.choices,
        grantedAt: timestamp.toISOString(),
        auditHash: currentHash,
      },
    });
  } catch (err) {
    console.warn('Non-blocking webhook delivery error during grant:', err);
  }

  return {
    success: true,
    data: {
      consentId: result.id,
      hash: currentHash,
      granted: true,
      noticeId: notice.id,
      businessId: notice.businessId,
      createdAt: result.createdAt,
    },
  };
}

/**
 * Executes a Revoke Consent transaction:
 * 1. Checks record existence & strictly verifies user ownership.
 * 2. Fetches latest audit chain hash.
 * 3. Updates ConsentRecord (granted = false, revokedAt = now) & creates chained AuditLog.
 * 4. Synchronously dispatches webhook to business endpoint.
 */
export async function processRevokeConsent(
  userId: string,
  input: RevokeConsentInput
): Promise<ConsentEngineResult> {
  // Find record and verify ownership
  const record = await prisma.consentRecord.findUnique({
    where: { id: input.recordId },
    select: { id: true, userId: true, noticeId: true, businessId: true, granted: true, choices: true },
  });

  if (!record) {
    return { success: false, error: 'Consent Record not found' };
  }

  // Cross-user ownership enforcement
  if (record.userId !== userId) {
    return {
      success: false,
      error: 'Forbidden: You do not own this consent record',
      isForbidden: true,
    };
  }

  if (!record.granted) {
    return { success: false, error: 'Consent has already been revoked' };
  }

  const previousHash = await getLatestAuditHash();
  const timestamp = new Date();

  const payload = {
    userId,
    recordId: record.id,
    noticeId: record.noticeId,
    businessId: record.businessId,
    action: ConsentAction.REVOKE,
    reason: input.reason || 'User requested one-tap revocation',
    timestamp: timestamp.toISOString(),
  };

  const { currentHash } = hashAction(payload, previousHash);

  const updatedRecord = await prisma.$transaction(async (tx) => {
    const updated = await tx.consentRecord.update({
      where: { id: record.id },
      data: {
        granted: false,
        revokedAt: timestamp,
      },
    });

    await tx.auditLog.create({
      data: {
        recordId: record.id,
        action: ConsentAction.REVOKE,
        actorId: userId,
        previousHash,
        currentHash,
        payload,
        timestamp,
      },
    });

    return updated;
  });

  // Synchronous webhook delivery right after audit log is committed
  try {
    await deliverWebhook({
      businessId: record.businessId,
      eventType: 'consent.revoked',
      payload: {
        recordId: updatedRecord.id,
        userId,
        noticeId: record.noticeId,
        revokedAt: timestamp.toISOString(),
        auditHash: currentHash,
      },
    });
  } catch (err) {
    console.warn('Non-blocking webhook delivery error during revoke:', err);
  }

  return {
    success: true,
    data: {
      consentId: updatedRecord.id,
      hash: currentHash,
      granted: false,
      noticeId: updatedRecord.noticeId,
      businessId: updatedRecord.businessId,
      revokedAt: updatedRecord.revokedAt,
    },
  };
}

/**
 * Fetches all consent records owned by the authenticated user.
 */
export async function getUserConsents(userId: string) {
  return await prisma.consentRecord.findMany({
    where: { userId },
    include: {
      notice: {
        select: {
          id: true,
          title: true,
          purposes: true,
          simplifiedVersions: true,
        },
      },
      business: {
        select: {
          id: true,
          name: true,
          tier: true,
        },
      },
      auditLogs: {
        orderBy: { timestamp: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
