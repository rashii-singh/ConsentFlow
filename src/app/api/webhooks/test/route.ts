import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { deliverWebhook } from '@/lib/webhooks/deliver';
import { testWebhookSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Only BUSINESS users can fire test webhooks
    if (session.user.role !== UserRole.BUSINESS) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only business users can test webhooks' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = testWebhookSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { webhookUrl } = parseResult.data;

    // Strictly fetch the business owned by the authenticated user
    const business = await prisma.business.findFirst({
      where: { userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'No business profile found for your account' },
        { status: 404 }
      );
    }

    const targetUrl = webhookUrl || business.webhookUrl;

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: 'No webhook URL configured. Please enter a valid URL.' },
        { status: 400 }
      );
    }

    // Update webhook URL if provided and different from current
    const activeBusiness =
      webhookUrl && webhookUrl !== business.webhookUrl
        ? await prisma.business.update({
            where: { id: business.id },
            data: { webhookUrl },
          })
        : business;

    // Dispatch live test payload using the caller's own business only
    const testDelivery = await deliverWebhook({
      businessId: activeBusiness.id,
      eventType: 'consent.granted.test',
      payload: {
        testEvent: true,
        message: 'This is a live test webhook payload from ConsentFlow Webhook Engine',
        timestamp: new Date().toISOString(),
        businessName: activeBusiness.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test webhook dispatched successfully',
      delivery: testDelivery,
    });
  } catch (error: any) {
    console.error('API /api/webhooks/test Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
