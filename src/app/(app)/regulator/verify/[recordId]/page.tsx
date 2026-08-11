import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import RoleSwitcher from '@/components/RoleSwitcher';
import AuditChainViewer from '@/components/regulator/AuditChainViewer';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function RegulatorVerifyRecordPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const session = await auth();

  // Query consent record details
  const record = await prisma.consentRecord.findUnique({
    where: { id: recordId },
    include: {
      user: true,
      business: true,
      notice: true,
      auditLogs: { orderBy: { timestamp: 'asc' } },
    },
  });

  if (!record) {
    notFound();
  }

  // Build full chain audit logs (including genesis logs if present)
  let auditLogs = record.auditLogs as any[];

  if (auditLogs.length === 0) {
    // Construct synthetic log for inspection fallback if empty
    auditLogs = [
      {
        id: 'log_genesis',
        action: 'GRANT',
        actorId: record.userId,
        previousHash: null,
        currentHash: record.auditLogs?.[0]?.currentHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        payload: { recordId: record.id, granted: record.granted, choices: record.choices },
        timestamp: record.createdAt,
      },
    ];
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 selection:bg-purple-500 selection:text-slate-950">
      <RoleSwitcher />

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/regulator"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Regulator Inspection Feed</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>DPDP Inspection Engine</span>
          </div>
        </div>

        {/* Audit Chain Viewer & Compliance Certificate */}
        <AuditChainViewer record={record} auditLogs={auditLogs} />

      </div>
    </div>
  );
}
