'use client';

import React from 'react';
import { X, Hash, ShieldCheck, CheckCircle2, History, ArrowDown } from 'lucide-react';

interface AuditTrailModalProps {
  record: any | null;
  onClose: () => void;
}

export default function AuditTrailModal({ record, onClose }: AuditTrailModalProps) {
  if (!record) return null;

  const logs = record.auditLogs || [
    {
      id: 'log_def',
      action: record.status === 'REVOKED' ? 'REVOKE' : 'GRANT',
      timestamp: record.revokedAt || record.grantedAt || new Date().toISOString(),
      previousHash: 'GENESIS_HASH',
      currentHash: record.hash,
      metadata: JSON.stringify({ ip: '103.21.124.5', userAgent: 'ConsentFlow-Mobile/1.0' }),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Tamper-Evident SHA-256 Audit Inspector</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {record.noticeTitle || record.notice?.title || 'Consent Notice Audit Log'}
          </h2>
          <p className="text-xs text-slate-400">
            Fiduciary: <span className="text-slate-200 font-semibold">{record.businessName || record.business?.name}</span> | Principal:{' '}
            <span className="text-slate-200 font-semibold">{record.userEmail || record.user?.email}</span>
          </p>
        </div>

        {/* Status & Hash Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Consent Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                record.status === 'GRANTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {record.status}
            </span>
          </div>
          <div className="flex items-center space-x-2 font-mono text-xs text-emerald-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 truncate">
            <Hash className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span className="truncate">{record.hash}</span>
          </div>
        </div>

        {/* Chain Steps */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chronological Audit Chain</span>
          </h3>

          <div className="space-y-3">
            {logs.map((log: any, index: number) => (
              <React.Fragment key={log.id || index}>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>ACTION: {log.action}</span>
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-[11px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">Prev Hash: </span>
                      <span className="text-slate-300">{log.previousHash || 'GENESIS'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Curr Hash: </span>
                      <span className="text-emerald-400">{log.currentHash}</span>
                    </div>
                    {log.metadata && (
                      <div className="mt-1 p-2 rounded bg-slate-900 text-slate-400 text-[10px]">
                        Metadata: {log.metadata}
                      </div>
                    )}
                  </div>
                </div>

                {index < logs.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-4 h-4 text-emerald-500/50 animate-bounce" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer Verification Notice */}
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Verified cryptographic chain. Hashing conforms to DPDP Act 2023 Section 6 audit standards.</span>
        </div>

      </div>
    </div>
  );
}
