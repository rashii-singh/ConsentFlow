import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import RoleSwitcher from '@/components/RoleSwitcher';
import BusinessGrievanceTable from '@/components/business/BusinessGrievanceTable';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default async function BusinessGrievancesPage() {
  const session = await auth();

  const business = await prisma.business.findFirst({
    where: { userId: session?.user?.id || '' },
  }) || await prisma.business.findFirst();

  const grievances = await prisma.grievanceTicket.findMany({
    where: business?.id ? { businessId: business.id } : {},
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 selection:bg-amber-500 selection:text-slate-950">
      <RoleSwitcher />

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/business"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Business Dashboard</span>
            </Link>
            <h1 className="text-2xl font-black text-white flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>Grievance Redressal SLA Desk</span>
            </h1>
          </div>

          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 self-start sm:self-auto">
            Fiduciary: {business?.name || 'Demo Fiduciary'}
          </span>
        </div>

        {/* Interactive Grievance Resolution Desk Component */}
        <BusinessGrievanceTable initialGrievances={grievances} />

      </div>
    </div>
  );
}
