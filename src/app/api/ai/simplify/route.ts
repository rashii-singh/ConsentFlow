import { NextResponse } from 'next/server';
import { simplifyNoticeText } from '@/lib/ai/groq';

// Simple in-memory rate limiter (10 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 60000 }); // 1 min window
    return true;
  }

  if (entry.count >= 10) {
    return false; // Limit exceeded
  }

  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too Many Requests: Rate limit exceeded (max 10 requests per minute)',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { text, lang = 'en' } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Notice text is required for AI simplification' },
        { status: 400 }
      );
    }

    const result = await simplifyNoticeText(text, lang);

    return NextResponse.json({
      success: true,
      lang,
      isFallback: result.isFallback,
      model: result.model,
      data: result.data,
    });
  } catch (error: any) {
    console.error('API /api/ai/simplify Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
