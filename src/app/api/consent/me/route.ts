import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getUserConsents } from '@/lib/consent/engine';
import { UserRole } from '@prisma/client';

export async function GET() {
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
        { success: false, error: 'Forbidden: Only Data Principal (CONSUMER) accounts can access personal consents' },
        { status: 403 }
      );
    }

    const consents = await getUserConsents(session.user.id);

    return NextResponse.json({
      success: true,
      count: consents.length,
      data: consents,
    });
  } catch (error: any) {
    console.error('API /api/consent/me Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
