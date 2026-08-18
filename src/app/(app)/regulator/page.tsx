import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import RoleSwitcher from '@/components/RoleSwitcher';
import RegulatorSearchFeed from '@/components/regulator/RegulatorSearchFeed';
import { Eye, ShieldCheck, Search, Scale, FileCheck, Building2, AlertTriangle } from 'lucide-react';

export default async function RegulatorDashboard() {
  const session = await auth();

  // Query system-wide statistics for regulator overview
  const totalBusinesses = await prisma.business.count();
  const totalGrievances = await prisma.grievanceTicket.count({
    where: { status: { in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] } },
  });

  // Query consent records for inspection
  const initialRecords = await prisma.consentRecord.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, name: true } },
      business: { select: { id: true, name: true, tier: true } },
      notice: { select: { id: true, title: true } },
      auditLogs: { orderBy: { timestamp: 'desc' } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 selection:bg-purple-500 selection:text-slate-950">
      <RoleSwitcher />

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>Data Protection Board of India — Official Inspector Portal</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              DPDP Compliance Audit & Verification Engine
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Inspect cryptographic SHA-256 hash chains across Data Fiduciaries, audit consent record integrity, and issue legal compliance certificates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
              <div className="text-2xl font-black text-purple-400">{initialRecords.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Audited Records</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
              <div className="text-2xl font-black text-cyan-400">{totalBusinesses}</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Fiduciaries</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
              <div className="text-2xl font-black text-amber-400">{totalGrievances}</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Open Complaints</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Audit Coverage</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Interactive Search & Inspection Feed */}
        <RegulatorSearchFeed initialRecords={initialRecords as any} />
      </div>
    </div>
  );
}
