import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { GrievanceStatus, GrievanceType, UserRole } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    let grievances = [];

    if (role === UserRole.CONSUMER) {
      grievances = await prisma.grievanceTicket.findMany({
        where: { userId: session.user.id },
        include: { business: true },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === UserRole.BUSINESS) {
      const business = await prisma.business.findFirst({
        where: { userId: session.user.id },
      });
      if (!business) {
        return NextResponse.json({ success: true, data: [] });
      }
      grievances = await prisma.grievanceTicket.findMany({
        where: { businessId: business.id },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === UserRole.REGULATOR) {
      // REGULATOR sees all grievances across system
      grievances = await prisma.grievanceTicket.findMany({
        include: { user: true, business: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
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

    // Only CONSUMERs can file grievances
    if (session.user.role !== UserRole.CONSUMER) {
      return NextResponse.json({ success: false, error: 'Forbidden: Only consumers can file grievances' }, { status: 403 });
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

    // Target business must be explicitly provided or resolved from DB — no hardcoded fallback IDs
    let targetBusinessId = businessId as string | undefined;
    if (!targetBusinessId) {
      const firstBiz = await prisma.business.findFirst();
      if (!firstBiz) {
        return NextResponse.json(
          { success: false, error: 'No registered businesses found. Cannot file a grievance.' },
          { status: 400 }
        );
      }
      targetBusinessId = firstBiz.id;
    }

    // Verify the target business exists
    const targetBusiness = await prisma.business.findUnique({ where: { id: targetBusinessId } });
    if (!targetBusiness) {
      return NextResponse.json({ success: false, error: 'Target business not found' }, { status: 404 });
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

    const role = session.user.role;

    // Only BUSINESS and REGULATOR can update grievance status
    if (role !== UserRole.BUSINESS && role !== UserRole.REGULATOR) {
      return NextResponse.json({ success: false, error: 'Forbidden: Only businesses and regulators can update grievances' }, { status: 403 });
    }

    const body = await req.json();
    const { ticketId, status, resolutionNotes, resolution } = body;

    if (!ticketId || !status) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status enum
    const validStatuses = Object.values(GrievanceStatus);
    if (!validStatuses.includes(status as GrievanceStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch the ticket first to enforce ownership for BUSINESS role
    const ticket = await prisma.grievanceTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Grievance ticket not found' }, { status: 404 });
    }

    if (role === UserRole.BUSINESS) {
      // Verify the ticket belongs to this business
      const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
      if (!business || ticket.businessId !== business.id) {
        return NextResponse.json({ success: false, error: 'Forbidden: This ticket does not belong to your business' }, { status: 403 });
      }
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
