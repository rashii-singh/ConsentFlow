import crypto from 'crypto';

/**
 * Deterministically stringifies an object by sorting its keys recursively.
 * Ensures consistent canonical JSON across all clients and environments.
 */
export function canonicalStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const sortedEntries = sortedKeys.map(
    (key) => JSON.stringify(key) + ':' + canonicalStringify(obj[key])
  );

  return '{' + sortedEntries.join(',') + '}';
}

/**
 * Computes a SHA-256 hash string in hex format.
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}
