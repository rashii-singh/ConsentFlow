import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { processGrantConsent, processRevokeConsent } from '@/lib/consent/engine';
import { grantConsentSchema, revokeConsentSchema } from '@/lib/validators';
import { UserRole } from '@prisma/client';

/**
 * POST /api/consent
 * Generic consent action endpoint (grant or revoke).
 * Strictly requires authenticated CONSUMER role and delegates to consent engine.
 */
export async function POST(request: Request) {
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
        { success: false, error: 'Forbidden: Only Data Principal (CONSUMER) accounts can grant or revoke consent' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === 'REVOKE') {
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

      return NextResponse.json({ success: true, action: 'REVOKE', data: result.data });
    }

    // Default to GRANT
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

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'ConsentFlow-Client';

    const result = await processGrantConsent(session.user.id, {
      ...parseResult.data,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, action: 'GRANT', data: result.data });
  } catch (error: any) {
    console.error('API /api/consent Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
