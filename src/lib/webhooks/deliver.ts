import { prisma } from '@/lib/prisma';
import { WebhookStatus } from '@prisma/client';
import { signWebhookPayload } from './signer';

// Exponential backoff intervals in milliseconds (1m, 5m, 15m, 1h, 6h)
const BACKOFF_MS = [
  1 * 60 * 1000,      // 1 minute
  5 * 60 * 1000,      // 5 minutes
  15 * 60 * 1000,     // 15 minutes
  60 * 60 * 1000,     // 1 hour
  6 * 60 * 60 * 1000, // 6 hours
];

/**
 * Calculates the next retry timestamp with exponential backoff and random jitter.
 */
export function calculateNextRetry(attemptIndex: number): Date {
  const index = Math.min(Math.max(0, attemptIndex), BACKOFF_MS.length - 1);
  const baseMs = BACKOFF_MS[index];
  // Add 0-20% random jitter to avoid thundering herd problem
  const jitterMs = Math.floor(Math.random() * (baseMs * 0.2));
  return new Date(Date.now() + baseMs + jitterMs);
}

export interface DeliverWebhookParams {
  businessId: string;
  eventType: string; // e.g. "consent.granted", "consent.revoked"
  payload: any;
}

/**
 * Synchronously delivers a webhook event to a business endpoint.
 * Times out after 10 seconds. Logs delivery status to WebhookDelivery.
 * Schedules retry with exponential backoff if delivery fails.
 */
export async function deliverWebhook({
  businessId,
  eventType,
  payload,
}: DeliverWebhookParams) {
  // Fetch business details
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true, webhookUrl: true, apiKey: true },
  });

  if (!business || !business.webhookUrl) {
    // No webhook configured, skip execution cleanly
    return null;
  }

  const webhookSecret = business.apiKey || process.env.WEBHOOK_SECRET || 'default_webhook_secret';
  const fullEventPayload = {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    eventType,
    businessId: business.id,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  const payloadString = JSON.stringify(fullEventPayload);
  const signature = signWebhookPayload(payloadString, webhookSecret);

  const startTime = Date.now();
  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let isSuccess = false;

  try {
    // 10-second timeout AbortSignal for serverless safety
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(business.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-consentflow-signature': signature,
        'x-consentflow-event': eventType,
        'User-Agent': 'ConsentFlow-WebhookEngine/2.0',
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    responseStatus = res.status;
    const rawBody = await res.text();
    responseBody = rawBody.substring(0, 2000); // Limit stored response body size

    if (res.ok) {
      isSuccess = true;
    }
  } catch (err: any) {
    console.warn(`Webhook dispatch failed for ${business.name} (${eventType}):`, err.message);
    responseStatus = 0;
    responseBody = `Fetch Error: ${err.message || 'Timeout after 10000ms'}`;
  }

  const now = new Date();

  if (isSuccess) {
    return await prisma.webhookDelivery.create({
      data: {
        businessId: business.id,
        eventType,
        payload: fullEventPayload,
        signature,
        status: WebhookStatus.DELIVERED,
        responseStatus,
        responseBody,
        retryCount: 0,
        deliveredAt: now,
      },
    });
  } else {
    // Schedule first retry
    const nextRetryAt = calculateNextRetry(0);

    return await prisma.webhookDelivery.create({
      data: {
        businessId: business.id,
        eventType,
        payload: fullEventPayload,
        signature,
        status: WebhookStatus.RETRYING,
        responseStatus,
        responseBody,
        retryCount: 1,
        nextRetryAt,
      },
    });
  }
}
