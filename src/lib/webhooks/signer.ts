import crypto from 'crypto';

/**
 * Computes an HMAC-SHA256 signature for a webhook payload string.
 * @param payload - The stringified payload body
 * @param secret - The business API key or secret key
 * @returns SHA-256 signature in format "sha256=<hex_hash>"
 */
export function signWebhookPayload(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Verifies an incoming HMAC-SHA256 signature against expected payload and secret.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const expectedSignature = signWebhookPayload(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
