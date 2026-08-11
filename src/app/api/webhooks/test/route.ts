import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { deliverWebhook } from '@/lib/webhooks/deliver';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { webhookUrl } = body;

    let business = await prisma.business.findFirst({
      where: { userId: session.user.id },
    });

    if (!business) {
      business = await prisma.business.findFirst();
    }

    if (!business) {
      return NextResponse.json({ success: false, error: 'No business profile found' }, { status: 404 });
    }

    const targetUrl = webhookUrl || business.webhookUrl;

    if (!targetUrl) {
      return NextResponse.json({ success: false, error: 'No webhook URL configured' }, { status: 400 });
    }

    // Update webhook URL if provided
    if (webhookUrl && webhookUrl !== business.webhookUrl) {
      business = await prisma.business.update({
        where: { id: business.id },
        data: { webhookUrl },
      });
    }

    // Dispatch live test payload
    const testDelivery = await deliverWebhook({
      businessId: business.id,
      eventType: 'consent.granted.test',
      payload: {
        testEvent: true,
        message: 'This is a live test webhook payload from ConsentFlow Engine',
        timestamp: new Date().toISOString(),
        businessName: business.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test webhook dispatched successfully',
      delivery: testDelivery,
    });
  } catch (error: any) {
    console.error('API /api/webhooks/test Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
