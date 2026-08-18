import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { grantConsentSchema } from '@/lib/validators';
import { processGrantConsent } from '@/lib/consent/engine';
import { UserRole } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== UserRole.CONSUMER) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only Data Principal (CONSUMER) accounts can grant consent' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Validate request body
    const parseResult = grantConsentSchema.safeParse(body);
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

    // Capture metadata
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'ConsentFlow-Client';

    const result = await processGrantConsent(session.user.id, {
      ...parseResult.data,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        consentId: result.data!.consentId,
        hash: result.data!.hash,
        granted: result.data!.granted,
        noticeId: result.data!.noticeId,
        businessId: result.data!.businessId,
        createdAt: result.data!.createdAt,
      },
    });
  } catch (error: any) {
    console.error('API /api/consent/grant Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
