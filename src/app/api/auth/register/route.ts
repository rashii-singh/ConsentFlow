import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerUserSchema } from '@/lib/validators';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = registerUserSchema.safeParse(body);

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

    const { name, email, role, organizationName, preferredLang } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email address already exists. Please sign in.',
        },
        { status: 409 }
      );
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        role,
        preferredLang: preferredLang || 'en',
      },
    });

    // If registering as a Data Fiduciary (BUSINESS), provision organization profile
    let business = null;
    if (role === UserRole.BUSINESS) {
      const apiKey = 'cf_live_' + crypto.randomBytes(16).toString('hex');
      business = await prisma.business.create({
        data: {
          name: organizationName?.trim() || `${user.name}'s Organization`,
          userId: user.id,
          webhookUrl: 'https://webhook.site/demo-endpoint',
          apiKey,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account successfully registered.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          businessId: business?.id || null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API /api/auth/register Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register account' },
      { status: 500 }
    );
  }
}
