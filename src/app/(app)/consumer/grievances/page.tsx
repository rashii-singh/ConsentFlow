import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import RoleSwitcher from '@/components/RoleSwitcher';
import ConsumerGrievanceView from '@/components/consumer/ConsumerGrievanceView';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default async function ConsumerGrievancesPage() {
  const session = await auth();

  const grievances = session?.user?.id
    ? await prisma.grievanceTicket.findMany({
        where: { userId: session.user.id },
        include: { business: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 selection:bg-amber-500 selection:text-slate-950">
      <RoleSwitcher />

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/consumer"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Consumer Dashboard</span>
            </Link>
            <h1 className="text-2xl font-black text-white flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>DPDP Statutory Grievance Redressal Portal</span>
            </h1>
          </div>

          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 self-start sm:self-auto">
            Section 13 Statutory Right
          </span>
        </div>

        {/* Interactive Grievance Filing & SLA Tracker View */}
        <ConsumerGrievanceView initialGrievances={grievances} businesses={businesses} />

      </div>
    </div>
  );
}
