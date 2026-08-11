import crypto from 'crypto';

/**
 * Computes a SHA-256 hash string for a consent record to build tamper-evident audit logs.
 */
export function generateConsentHash(data: {
  userId: string;
  noticeId: string;
  businessId: string;
  status: string;
  dataTypesShared: string[];
  timestamp: string | Date;
  previousHash?: string;
}): string {
  const content = JSON.stringify({
    userId: data.userId,
    noticeId: data.noticeId,
    businessId: data.businessId,
    status: data.status,
    dataTypesShared: [...data.dataTypesShared].sort(),
    timestamp: new Date(data.timestamp).toISOString(),
    previousHash: data.previousHash || 'GENESIS',
  });

  return crypto.createHash('sha256').update(content).digest('hex');
}
