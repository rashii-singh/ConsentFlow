import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { revokeConsentSchema } from '@/lib/validators';
import { processRevokeConsent } from '@/lib/consent/engine';
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
        { success: false, error: 'Forbidden: Only Data Principal (CONSUMER) accounts can revoke consent' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Validate request body
    const parseResult = revokeConsentSchema.safeParse(body);
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

    const result = await processRevokeConsent(session.user.id, parseResult.data);

    if (!result.success) {
      const status = result.isForbidden ? 403 : 400;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      data: {
        consentId: result.data!.consentId,
        hash: result.data!.hash,
        granted: result.data!.granted,
        noticeId: result.data!.noticeId,
        businessId: result.data!.businessId,
        revokedAt: result.data!.revokedAt,
      },
    });
  } catch (error: any) {
    console.error('API /api/consent/revoke Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
