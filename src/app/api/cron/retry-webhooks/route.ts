import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WebhookStatus } from '@prisma/client';
import { calculateNextRetry } from '@/lib/webhooks/deliver';
import crypto from 'crypto';

function isSecretAuthorized(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const provBuf = Buffer.from(provided, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (provBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(provBuf, expBuf);
}

export async function GET(req: Request) {
  try {
    // 1. Verify CRON_SECRET authorization if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      const { searchParams } = new URL(req.url);
      const querySecret = searchParams.get('secret');

      const isAuthorized =
        isSecretAuthorized(bearerToken, cronSecret) ||
        isSecretAuthorized(querySecret, cronSecret);

      if (!isAuthorized) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid CRON_SECRET token' },
          { status: 401 }
        );
      }
    }

    const now = new Date();

    // 2. Find all webhook deliveries pending retry
    const pendingDeliveries = await prisma.webhookDelivery.findMany({
      where: {
        status: WebhookStatus.RETRYING,
        OR: [
          { nextRetryAt: { lte: now } },
          { nextRetryAt: null },
        ],
      },
      include: {
        business: {
          select: { id: true, name: true, webhookUrl: true, apiKey: true },
        },
      },
      take: 50, // Batch limit per invocation for serverless safety
      orderBy: { createdAt: 'asc' },
    });

    let deliveredCount = 0;
    let retryingCount = 0;
    let dlqCount = 0;

    for (const delivery of pendingDeliveries) {
      if (!delivery.business?.webhookUrl) {
        // Business webhook URL removed or missing, move to DLQ
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: WebhookStatus.DLQ,
            responseBody: 'Skipped: No valid webhookUrl found for business profile',
            nextRetryAt: null,
          },
        });
        dlqCount++;
        continue;
      }

      const payloadString = JSON.stringify(delivery.payload);
      let isSuccess = false;
      let responseStatus = 0;
      let responseBody = '';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(delivery.business.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-consentflow-signature': delivery.signature,
            'x-consentflow-event': delivery.eventType,
            'x-consentflow-retry-count': String(delivery.retryCount),
            'User-Agent': 'ConsentFlow-CronRetryEngine/2.0',
          },
          body: payloadString,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        responseStatus = res.status;
        const text = await res.text();
        responseBody = text.substring(0, 2000);

        if (res.ok) {
          isSuccess = true;
        }
      } catch (err: any) {
        responseStatus = 0;
        responseBody = `Retry Fetch Error: ${err.message || 'Timeout after 10000ms'}`;
      }

      if (isSuccess) {
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: WebhookStatus.DELIVERED,
            responseStatus,
            responseBody,
            deliveredAt: new Date(),
            nextRetryAt: null,
          },
        });
        deliveredCount++;
      } else {
        const nextAttemptCount = delivery.retryCount + 1;

        if (nextAttemptCount >= 5) {
          // Exceeded max attempts (5) -> Move to Dead Letter Queue (DLQ)
          await prisma.webhookDelivery.update({
            where: { id: delivery.id },
            data: {
              status: WebhookStatus.DLQ,
              retryCount: nextAttemptCount,
              responseStatus,
              responseBody,
              nextRetryAt: null,
            },
          });
          dlqCount++;
        } else {
          // Schedule next retry with exponential backoff and jitter
          const nextRetryAt = calculateNextRetry(nextAttemptCount - 1);

          await prisma.webhookDelivery.update({
            where: { id: delivery.id },
            data: {
              status: WebhookStatus.RETRYING,
              retryCount: nextAttemptCount,
              responseStatus,
              responseBody,
              nextRetryAt,
            },
          });
          retryingCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      processedCount: pendingDeliveries.length,
      deliveredCount,
      retryingCount,
      dlqCount,
    });
  } catch (error: any) {
    console.error('API /api/cron/retry-webhooks Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Allow POST as well for cron service compatibility (Vercel Cron, GitHub Actions, cron-job.org)
export async function POST(req: Request) {
  return GET(req);
}
