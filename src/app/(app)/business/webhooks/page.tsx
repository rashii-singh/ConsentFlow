import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import RoleSwitcher from '@/components/RoleSwitcher';
import WebhookLogTable from '@/components/business/WebhookLogTable';
import Link from 'next/link';
import { ArrowLeft, Send, Key, Globe, ShieldCheck } from 'lucide-react';

export default async function BusinessWebhooksPage() {
  const session = await auth();

  const business = await prisma.business.findFirst({
    where: { userId: session?.user?.id || '' },
    include: { webhookLogs: { orderBy: { createdAt: 'desc' }, take: 50 } },
  }) || await prisma.business.findFirst({
    include: { webhookLogs: { orderBy: { createdAt: 'desc' }, take: 50 } },
  });

  const webhookUrl = business?.webhookUrl || 'https://webhook.site/demo-endpoint';
  const apiKey = business?.apiKey || 'cf_live_demo_secret_key';
  const deliveries = business?.webhookLogs || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 selection:bg-purple-500 selection:text-slate-950">
      <RoleSwitcher />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/business"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-purple-400 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Business Dashboard</span>
            </Link>
            <h1 className="text-2xl font-black text-white flex items-center space-x-2">
              <Send className="w-6 h-6 text-purple-400" />
              <span>Serverless Signed Webhook Engine</span>
            </h1>
          </div>

          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 text-purple-400 border border-slate-800 self-start sm:self-auto">
            Fiduciary: {business?.name || 'Demo Fiduciary'}
          </span>
        </div>

        {/* Interactive Webhook Configuration & Log Inspector */}
        <WebhookLogTable initialWebhookUrl={webhookUrl} initialApiKey={apiKey} initialDeliveries={deliveries} />

      </div>
    </div>
  );
}
