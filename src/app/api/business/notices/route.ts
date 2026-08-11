import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { simplifyNoticeText } from '@/lib/ai/groq';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const business = await prisma.business.findFirst({
      where: { userId: session.user.id },
      include: { notices: true },
    });

    const notices = business?.notices || await prisma.consentNotice.findMany({ take: 10 });

    return NextResponse.json({ success: true, data: notices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, rawLegalText, purposes } = body;

    if (!title || !rawLegalText || !purposes || !Array.isArray(purposes)) {
      return NextResponse.json(
        { success: false, error: 'Title, raw legal text, and purposes array are required' },
        { status: 400 }
      );
    }

    // Find or assign business for current user
    let business = await prisma.business.findFirst({
      where: { userId: session.user.id },
    });

    if (!business) {
      business = await prisma.business.findFirst() || await prisma.business.create({
        data: {
          name: 'Demo Data Fiduciary',
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

    return NextResponse.json({ success: true, data: notice });
  } catch (error: any) {
    console.error('API /api/business/notices POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
