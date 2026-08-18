import crypto from 'crypto';
import { canonicalStringify } from '@/lib/crypto/hash';

/**
 * Computes an HMAC-SHA256 signature for a webhook payload string or object.
 * @param payload - The stringified or raw payload object
 * @param secret - The business API key or secret key
 * @returns SHA-256 signature in format "sha256=<hex_hash>"
 */
export function signWebhookPayload(payload: string | object, secret: string): string {
  const payloadString = typeof payload === 'string' ? payload : canonicalStringify(payload);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadString, 'utf8');
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Verifies an incoming HMAC-SHA256 signature against expected payload and secret.
 * Uses timingSafeEqual with buffer length validation to prevent unhandled RangeError exceptions.
 */
export function verifyWebhookSignature(
  payload: string | object,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  const expectedSignature = signWebhookPayload(payload, secret);
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');

  // Prevent RangeError from timingSafeEqual on length mismatch
  if (sigBuf.length !== expBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, expBuf);
}
