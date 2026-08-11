import { canonicalStringify, sha256 } from './hash';

export interface AuditLogItem {
  id?: string;
  recordId?: string;
  action: string;
  actorId: string;
  previousHash: string | null;
  currentHash: string;
  payload: any;
  timestamp?: Date | string;
}

export interface VerificationResult {
  valid: boolean;
  status: 'VALID' | 'TAMPERED';
  brokenIndex: number | null;
  error?: string;
}

/**
 * Generates the next hash in the cryptographic audit chain.
 * Genesis records use previousHash = null or "".
 * Formula: SHA256(previousHash + canonicalPayload)
 */
export function hashAction(
  payload: any,
  previousHash: string | null = null
): { currentHash: string; canonicalPayload: string } {
  const canonicalPayload = canonicalStringify(payload);
  const hashInput = (previousHash || '') + canonicalPayload;
  const currentHash = sha256(hashInput);

  return {
    currentHash,
    canonicalPayload,
  };
}

/**
 * Verifies a sequence of audit log entries for chain integrity.
 * 1. Checks previousHash linkage to preceding log's currentHash.
 * 2. Recomputes currentHash = SHA256(previousHash + canonicalPayload).
 * 3. Identifies broken index on any tampering or link mismatch.
 */
export function verifyChain(logs: AuditLogItem[]): VerificationResult {
  if (!logs || logs.length === 0) {
    return { valid: true, status: 'VALID', brokenIndex: null };
  }

  for (let i = 0; i < logs.length; i++) {
    const currentLog = logs[i];

    // 1. Verify linkage to previous log
    if (i === 0) {
      // Genesis record: previousHash must be null or empty string
      if (currentLog.previousHash !== null && currentLog.previousHash !== '') {
        return {
          valid: false,
          status: 'TAMPERED',
          brokenIndex: 0,
          error: `Genesis record must have null or empty previousHash, found: "${currentLog.previousHash}"`,
        };
      }
    } else {
      const expectedPrevHash = logs[i - 1].currentHash;
      if (currentLog.previousHash !== expectedPrevHash) {
        return {
          valid: false,
          status: 'TAMPERED',
          brokenIndex: i,
          error: `Linkage broken at index ${i}: previousHash "${currentLog.previousHash}" does not match previous record's currentHash "${expectedPrevHash}"`,
        };
      }
    }

    // 2. Recompute hash and verify integrity of current log payload
    const canonicalPayload = canonicalStringify(currentLog.payload);
    const expectedCurrentHash = sha256((currentLog.previousHash || '') + canonicalPayload);

    if (currentLog.currentHash !== expectedCurrentHash) {
      return {
        valid: false,
        status: 'TAMPERED',
        brokenIndex: i,
        error: `Payload tampering or invalid hash at index ${i}: currentHash "${currentLog.currentHash}" does not match recomputed hash "${expectedCurrentHash}"`,
      };
    }
  }

  return {
    valid: true,
    status: 'VALID',
    brokenIndex: null,
  };
}
