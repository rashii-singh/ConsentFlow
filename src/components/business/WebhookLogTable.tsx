'use client';

import React, { useState } from 'react';
import {
  Send,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  Hash,
  Shield,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface WebhookLogTableProps {
  initialWebhookUrl: string;
  initialApiKey: string;
  initialDeliveries: any[];
}

export default function WebhookLogTable({
  initialWebhookUrl,
  initialApiKey,
  initialDeliveries,
}: WebhookLogTableProps) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [apiKey] = useState(initialApiKey);
  const [deliveries, setDeliveries] = useState<any[]>(initialDeliveries);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTestWebhook = async (overrideUrl?: string) => {
    setTesting(true);
    setTestResult(null);

    const target = overrideUrl || webhookUrl;

    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: target }),
      });

      const json = await res.json();
      setTestResult(json);

      if (json.success && json.delivery) {
        setDeliveries((prev) => [json.delivery, ...prev]);
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Failed to dispatch test webhook' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Webhook Configuration & Manual Test Dispatcher */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-6 shadow-2xl">
        <div className="space-y-1 border-b border-slate-800 pb-4">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/30 uppercase tracking-wider">
            <Shield className="w-3 h-3 text-purple-400" />
            <span>HMAC-SHA256 Signed Endpoints</span>
          </div>
          <h2 className="text-xl font-bold text-white">Live Webhook Endpoint Configuration</h2>
          <p className="text-xs text-slate-400">
            ConsentFlow dispatches real-time HMAC-signed webhooks on every consent grant or revocation event.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>Target Webhook Endpoint URL</span>
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://webhook.site/your-unique-uuid-endpoint"
              className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>HMAC Secret Key</span>
              </label>
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-mono flex items-center space-x-1"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={apiKey}
              className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 outline-none select-all"
            />
          </div>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-1 animate-fadeIn ${
              testResult.success && testResult.delivery?.status === 'DELIVERED'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold">
              {testResult.success && testResult.delivery?.status === 'DELIVERED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span>{testResult.message || testResult.error}</span>
            </div>
            {testResult.delivery && (
              <div className="font-mono text-[11px] opacity-80">
                Delivery Status: {testResult.delivery.status} | Response Code: {testResult.delivery.responseStatus || 0}
                {testResult.delivery.nextRetryAt && (
                  <span> | Scheduled Retry: {new Date(testResult.delivery.nextRetryAt).toLocaleTimeString()}</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-400">
            Tip: Test live delivery to an active URL or simulate endpoint failure to demonstrate the retry queue.
          </p>

          <div className="flex items-center space-x-2.5">
            <button
              disabled={testing}
              onClick={() => handleTestWebhook('https://invalid-nonexistent-endpoint-test.internal/webhook')}
              className="py-2.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all flex items-center space-x-1.5 active:scale-95"
              title="Dispatches to an unreachable endpoint to demonstrate exponential retry scheduling"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate Failure & Retry Queue</span>
            </button>

            <button
              disabled={testing}
              onClick={() => handleTestWebhook()}
              className="py-2.5 px-5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-purple-500/20 active:scale-95"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>Firing Payload...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Test Live Dispatch</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Webhook Delivery Logs Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Webhook Delivery Logs ({deliveries.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Audit log of dispatched events, response codes, and exponential backoff retry states.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-400">Vercel Serverless Ready</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">HTTP Code</th>
                <th className="py-3 px-4">Retries</th>
                <th className="py-3 px-4">Signature</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No webhook deliveries logged yet. Click "Test Live Dispatch" above.
                  </td>
                </tr>
              ) : (
                deliveries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-950/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200">{item.eventType}</td>
                    
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'RETRYING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : item.status === 'DLQ'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={item.responseStatus === 200 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                        {item.responseStatus || 'FAILED / TIMEOUT'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400">{item.retryCount || 0}/5</td>

                    <td className="py-3 px-4 text-purple-400 truncate max-w-[140px]">
                      {item.signature}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayload(item)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3 text-purple-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspection Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-6 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Hash className="w-4 h-4 text-purple-400" />
                <span>Inspect Webhook Payload ({selectedPayload.eventType})</span>
              </h3>
              <button
                onClick={() => setSelectedPayload(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-400">HMAC SHA-256 Signature Header (x-consentflow-signature):</span>
                <div className="bg-slate-950 p-2 rounded-xl text-purple-300 border border-slate-800 mt-1 select-all break-all">
                  {selectedPayload.signature}
                </div>
              </div>

              <div>
                <span className="text-slate-400">JSON Request Body Dispatched:</span>
                <pre className="bg-slate-950 p-4 rounded-xl text-emerald-300 border border-slate-800 mt-1 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedPayload.payload, null, 2)}
                </pre>
              </div>

              {selectedPayload.responseBody && (
                <div>
                  <span className="text-slate-400">Target Server Response / Log:</span>
                  <pre className="bg-slate-950 p-3 rounded-xl text-slate-300 border border-slate-800 mt-1 overflow-x-auto max-h-32">
                    {selectedPayload.responseBody}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
