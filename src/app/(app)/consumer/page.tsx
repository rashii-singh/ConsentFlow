import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import RoleSwitcher from '@/components/RoleSwitcher';
import Link from 'next/link';
import { ShieldCheck, UserCheck, AlertTriangle, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import ConsumerConsentList from '@/components/consumer/ConsumerConsentList';

export default async function ConsumerDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  // Query User's consent records with full audit trail
  const consentRecords = userId
    ? await prisma.consentRecord.findMany({
        where: { userId },
        include: {
          notice: true,
          business: true,
          auditLogs: { orderBy: { timestamp: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  // Query available active consent notices
  const availableNotices = await prisma.consentNotice.findMany({
    where: { isActive: true },
    include: { business: true },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  const activeConsents = consentRecords.filter((r) => r.granted);
  const revokedConsents = consentRecords.filter((r) => !r.granted);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 selection:bg-emerald-500 selection:text-slate-950">
      <RoleSwitcher />

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Data Principal Citizen Portal — DPDP Act 2023</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome back, {session?.user?.name || 'Ananya Sharma'}
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Under Section 6(4) of the DPDP Act 2023, you have the statutory right to view, manage, and withdraw your consent at any time with 1-tap immediate effect.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
              <div className="text-2xl font-black text-emerald-400">{activeConsents.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Active Consents</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
              <div className="text-2xl font-black text-rose-400">{revokedConsents.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Revoked</div>
            </div>

            <Link
              href="/consumer/grievances"
              className="py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 self-stretch sm:self-auto justify-center"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Grievance Desk</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Interactive Active & Revoked Consents List */}
        <ConsumerConsentList initialRecords={consentRecords} />

        {/* Available Consent Notices Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Available Fiduciary Consent Notices</span>
              </h2>
              <p className="text-xs text-slate-400">
                Select a consent notice below to inspect AI plain-language summaries and configure granular choices.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">{availableNotices.length} Active Notices</span>
          </div>

          {availableNotices.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
              No active fiduciary consent notices found at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 truncate max-w-[180px]">
                        {notice.business.name}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {notice.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {notice.rawLegalText}
                    </p>
                  </div>

                  <Link
                    href={`/consumer/notices/${notice.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Review AI Notice & Grant</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
