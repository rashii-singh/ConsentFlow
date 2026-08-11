import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { revokeConsentSchema } from '@/lib/consent/validator';
import { processRevokeConsent } from '@/lib/consent/engine';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();

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
      const status = result.error?.includes('Forbidden') ? 403 : 400;
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
