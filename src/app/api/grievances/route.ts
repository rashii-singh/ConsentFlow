import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { GrievanceStatus, GrievanceType } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = session.user.role;

    let grievances = [];

    if (role === 'CONSUMER') {
      grievances = await prisma.grievanceTicket.findMany({
        where: { userId: session.user.id },
        include: { business: true },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'BUSINESS') {
      const business = await prisma.business.findFirst({
        where: { userId: session.user.id },
      });
      const businessId = business?.id;
      grievances = await prisma.grievanceTicket.findMany({
        where: businessId ? { businessId } : {},
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // REGULATOR sees all grievances across system
      grievances = await prisma.grievanceTicket.findMany({
        include: { user: true, business: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, data: grievances });
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
    const { businessId, type, subject, description } = body;

    const validTypes = Object.values(GrievanceType);
    if (!type || !validTypes.includes(type as GrievanceType)) {
      return NextResponse.json(
        { success: false, error: 'Valid grievance type (ACCESS, ERASURE, CORRECTION, NOMINATION) is required' },
        { status: 400 }
      );
    }

    if (!subject || !description) {
      return NextResponse.json(
        { success: false, error: 'Subject and description are required' },
        { status: 400 }
      );
    }

    // Default target business if none specified
    let targetBusinessId = businessId;
    if (!targetBusinessId) {
      const firstBiz = await prisma.business.findFirst();
      targetBusinessId = firstBiz?.id || 'biz_01';
    }

    // Auto-calculate statutory 30-day DPDP SLA deadline
    const createdAt = new Date();
    const slaDeadline = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    const ticket = await prisma.grievanceTicket.create({
      data: {
        userId: session.user.id,
        businessId: targetBusinessId,
        type: type as GrievanceType,
        description: subject ? `${subject}: ${description}` : description,
        status: GrievanceStatus.OPEN,
        slaDeadline,
        createdAt,
      },
      include: { business: true },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('API /api/grievances POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ticketId, status, resolutionNotes, resolution } = body;

    if (!ticketId || !status) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID and status are required' },
        { status: 400 }
      );
    }

    const isResolved = status === GrievanceStatus.RESOLVED || status === GrievanceStatus.ESCALATED;

    const updated = await prisma.grievanceTicket.update({
      where: { id: ticketId },
      data: {
        status: status as GrievanceStatus,
        resolution: resolutionNotes || resolution || null,
        resolvedAt: isResolved ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('API /api/grievances PATCH Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
