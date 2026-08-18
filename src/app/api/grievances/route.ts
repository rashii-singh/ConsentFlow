import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { GrievanceStatus, UserRole } from '@prisma/client';
import {
  createGrievanceSchema,
  updateGrievanceSchema,
  isValidGrievanceTransition,
} from '@/lib/validators';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
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
      // REGULATOR sees all grievances across the system
      grievances = await prisma.grievanceTicket.findMany({
        include: { user: true, business: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Invalid role' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, count: grievances.length, data: grievances });
  } catch (error: any) {
    console.error('API /api/grievances GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Only Data Principals (CONSUMER) can file grievances under Section 13
    if (session.user.role !== UserRole.CONSUMER) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only consumers can file grievance tickets' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = createGrievanceSchema.safeParse(body);

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

    const { businessId, type, subject, description } = parseResult.data;

    // Verify the target business exists
    const targetBusiness = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!targetBusiness) {
      return NextResponse.json(
        { success: false, error: 'Target Data Fiduciary business not found' },
        { status: 404 }
      );
    }

    // Auto-calculate statutory 30-day DPDP SLA deadline
    const createdAt = new Date();
    const slaDeadline = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    const ticket = await prisma.grievanceTicket.create({
      data: {
        userId: session.user.id,
        businessId: targetBusiness.id,
        type,
        description: subject ? `${subject}: ${description}` : description,
        status: GrievanceStatus.OPEN,
        slaDeadline,
        createdAt,
      },
      include: { business: true },
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/grievances POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const role = session.user.role;

    // Only BUSINESS and REGULATOR can update grievance status
    if (role !== UserRole.BUSINESS && role !== UserRole.REGULATOR) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only businesses and regulators can update grievance tickets' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = updateGrievanceSchema.safeParse(body);

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

    const { ticketId, status, resolutionNotes, resolution } = parseResult.data;

    // Fetch the ticket to enforce ownership and transition rules
    const ticket = await prisma.grievanceTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Grievance ticket not found' },
        { status: 404 }
      );
    }

    if (role === UserRole.BUSINESS) {
      // Verify the ticket belongs to the business registered by this user
      const business = await prisma.business.findFirst({
        where: { userId: session.user.id },
      });
      if (!business || ticket.businessId !== business.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: This ticket does not belong to your business organization' },
          { status: 403 }
        );
      }
    }

    // Validate state transition
    const transitionCheck = isValidGrievanceTransition(ticket.status, status, role);
    if (!transitionCheck.valid) {
      return NextResponse.json(
        { success: false, error: transitionCheck.error },
        { status: 400 }
      );
    }

    const resolutionText = resolutionNotes || resolution || ticket.resolution;

    // If resolving, require resolution notes
    if (status === GrievanceStatus.RESOLVED && !resolutionText) {
      return NextResponse.json(
        { success: false, error: 'Resolution explanation is required when resolving a grievance ticket' },
        { status: 400 }
      );
    }

    const isResolved = status === GrievanceStatus.RESOLVED;

    const updated = await prisma.grievanceTicket.update({
      where: { id: ticketId },
      data: {
        status,
        resolution: resolutionText || null,
        resolvedAt: isResolved ? (ticket.resolvedAt || new Date()) : null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('API /api/grievances PATCH Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
