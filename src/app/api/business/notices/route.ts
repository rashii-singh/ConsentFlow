import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { simplifyNoticeText } from '@/lib/ai/groq';
import { createNoticeSchema } from '@/lib/validators';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Only BUSINESS users can access their own notices
    if (session.user.role !== UserRole.BUSINESS) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only business users can access this resource' },
        { status: 403 }
      );
    }

    const business = await prisma.business.findFirst({
      where: { userId: session.user.id },
      include: { notices: { orderBy: { createdAt: 'desc' } } },
    });

    if (!business) {
      // No business profile yet — return empty list, not someone else's notices
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    return NextResponse.json({
      success: true,
      count: business.notices.length,
      data: business.notices,
    });
  } catch (error: any) {
    console.error('API /api/business/notices GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Only BUSINESS users can create notices
    if (session.user.role !== UserRole.BUSINESS) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only business users can create consent notices' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = createNoticeSchema.safeParse(body);

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

    const { title, rawLegalText, purposes } = parseResult.data;

    // Find business strictly owned by this user
    let business = await prisma.business.findFirst({
      where: { userId: session.user.id },
    });

    if (!business) {
      // Auto-create a business profile for this BUSINESS user only
      business = await prisma.business.create({
        data: {
          name: session.user.name ? `${session.user.name}'s Organization` : 'Demo Data Fiduciary',
          userId: session.user.id,
          webhookUrl: 'https://webhook.site/demo-endpoint',
          apiKey: 'cf_live_demo_' + Date.now(),
        },
      });
    }

    // Trigger AI summarization for English & Hindi
    const enAi = await simplifyNoticeText(rawLegalText, 'en');
    const hiAi = await simplifyNoticeText(rawLegalText, 'hi');

    const simplifiedVersions = {
      en: enAi.data,
      hi: hiAi.data,
    };

    const notice = await prisma.consentNotice.create({
      data: {
        businessId: business.id,
        title,
        rawLegalText,
        simplifiedVersions: JSON.parse(JSON.stringify(simplifiedVersions)),
        purposes: JSON.parse(JSON.stringify(purposes)),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: notice }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/business/notices POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
