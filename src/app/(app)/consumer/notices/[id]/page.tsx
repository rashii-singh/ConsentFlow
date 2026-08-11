import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import RoleSwitcher from '@/components/RoleSwitcher';
import NoticeReviewForm from '@/components/consumer/NoticeReviewForm';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function ConsumerNoticeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const notice = await prisma.consentNotice.findUnique({
    where: { id },
    include: { business: true },
  });

  if (!notice) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 selection:bg-emerald-500 selection:text-slate-950">
      <RoleSwitcher />

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/consumer"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Consumer Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fiduciary: {notice.business.name}</span>
          </div>
        </div>

        {/* Interactive Notice Review & Consent Form */}
        <NoticeReviewForm notice={notice as any} />

      </div>
    </div>
  );
}
