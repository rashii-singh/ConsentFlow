import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import RoleSwitcher from '@/components/RoleSwitcher';
import Link from 'next/link';
import { Building2, ShieldCheck, FileText, Send, AlertTriangle, ArrowRight, Hash, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

export default async function BusinessDashboard() {
  const session = await auth();

  // Find business profile for current user or default demo business
  const business = await prisma.business.findFirst({
    where: { userId: session?.user?.id || '' },
    include: {
      notices: true,
      consents: { orderBy: { createdAt: 'desc' }, take: 10, include: { notice: true, auditLogs: { orderBy: { timestamp: 'desc' } } } },
      webhookLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
      grievances: { where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } },
    },
  });

  const totalConsents = business?.consents?.length || 0;
  const activeConsents = business?.consents?.filter((c) => c.granted).length || 0;
  const activeNotices = business?.notices?.filter((n) => n.isActive).length || 0;
  const openGrievances = business?.grievances?.length || 0;

  const totalWebhooks = business?.webhookLogs?.length || 0;
  const deliveredWebhooks = business?.webhookLogs?.filter((w) => w.status === 'DELIVERED').length || 0;
  const webhookSuccessRate = totalWebhooks > 0 ? Math.round((deliveredWebhooks / totalWebhooks) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 selection:bg-cyan-500 selection:text-slate-950">
      <RoleSwitcher />

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Data Fiduciary Portal — {business?.name || 'HealthPlus Care'}</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-[10px] uppercase font-bold">
                {business?.tier || 'SIGNIFICANT'} TIER
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Fiduciary Compliance Control Center
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Monitor real-time consent collections, dispatch signed HMAC webhooks to your backend, and manage DPDP Act 2023 compliance audit trails.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/business/notices"
              className="py-3 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Notice Builder</span>
            </Link>

            <Link
              href="/business/webhooks"
              className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2 active:scale-95"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Webhook Logs</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Compliance StatsCards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Active Consents</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{activeConsents}</div>
            <p className="text-[11px] text-slate-500 font-mono">Total Granted: {totalConsents}</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Active Notices</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white">{activeNotices}</div>
            <p className="text-[11px] text-slate-500 font-mono">DPDP Compliant Notices</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Webhook Success</span>
              <Send className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-400">{webhookSuccessRate}%</div>
            <p className="text-[11px] text-slate-500 font-mono">{deliveredWebhooks}/{totalWebhooks} Delivered</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Open Grievances</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{openGrievances}</div>
            <p className="text-[11px] text-slate-500 font-mono">SLA & Data Officer Queue</p>
          </div>

        </div>

        {/* Real-Time Consent Audit Feed */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Hash className="w-5 h-5 text-cyan-400" />
                <span>Live Cryptographic Consent Stream</span>
              </h2>
              <p className="text-xs text-slate-400">
                Real-time stream of consent grants and revocations received from Data Principals with SHA-256 hash chains.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">SHA-256 Audit Trail</span>
          </div>

          <div className="space-y-3">
            {business?.consents?.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        c.granted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {c.granted ? 'GRANT' : 'REVOKE'}
                    </span>
                    <span className="font-bold text-slate-200">{c.notice?.title || 'Consent Record'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    User: {c.userId} | Choices: {JSON.stringify(c.choices)}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="font-mono text-[11px] text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800/80 truncate max-w-xs">
                    {c.auditLogs?.[0]?.currentHash || 'sha256_hash_chained'}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                    {new Date(c.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
