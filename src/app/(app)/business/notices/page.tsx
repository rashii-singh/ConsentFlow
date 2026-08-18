import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import RoleSwitcher from '@/components/RoleSwitcher';
import NoticeBuilderForm from '@/components/business/NoticeBuilderForm';
import Link from 'next/link';
import { ArrowLeft, FileText, Sparkles, Plus, CheckCircle2 } from 'lucide-react';

export default async function BusinessNoticesPage() {
  const session = await auth();

  const business = await prisma.business.findFirst({
    where: { userId: session?.user?.id || '' },
    include: { notices: { orderBy: { createdAt: 'desc' } } },
  });

  const notices = business?.notices || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 selection:bg-cyan-500 selection:text-slate-950">
      <RoleSwitcher />

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/business"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Business Dashboard</span>
            </Link>
            <h1 className="text-2xl font-black text-white flex items-center space-x-2">
              <FileText className="w-6 h-6 text-cyan-400" />
              <span>Fiduciary Consent Notice Manager</span>
            </h1>
          </div>

          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 text-cyan-400 border border-slate-800 self-start sm:self-auto">
            Fiduciary: {business?.name || 'Demo Fiduciary'}
          </span>
        </div>

        {/* Notice Builder Form Component */}
        <NoticeBuilderForm />

        {/* Existing Fiduciary Consent Notices List */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Active Fiduciary Notices ({notices.length})</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Pre-Summarized AI Enabled</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {notices.map((n) => (
              <div
                key={n.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-white">{n.title}</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-mono bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                  {n.rawLegalText}
                </p>

                {/* AI Summary Preview */}
                {(n.simplifiedVersions as any)?.en && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 space-y-1">
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      <span>Groq AI Pre-Simplified Summary (EN):</span>
                    </div>
                    <p className="line-clamp-2">"{(n.simplifiedVersions as any).en.simplified}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
