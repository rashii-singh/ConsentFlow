'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Hash, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface ConsumerConsentListProps {
  initialRecords: any[];
}

export default function ConsumerConsentList({ initialRecords }: ConsumerConsentListProps) {
  const [records, setRecords] = useState<any[]>(initialRecords);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevoke = async (recordId: string) => {
    setRevokingId(recordId);
    try {
      const res = await fetch('/api/consent/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, reason: 'User 1-tap statutory withdrawal' }),
      });

      const json = await res.json();
      if (json.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === recordId
              ? { ...r, granted: false, revokedAt: json.data.revokedAt, hash: json.data.hash }
              : r
          )
        );
      }
    } catch (err) {
      console.error('Revocation failed:', err);
    } finally {
      setRevokingId(null);
    }
  };

  const activeRecords = records.filter((r) => r.granted);
  const revokedRecords = records.filter((r) => !r.granted);

  return (
    <div className="space-y-8">
      
      {/* Active Consents Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Active Granted Consents ({activeRecords.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Consents currently active and shared with Data Fiduciaries. You may revoke consent at any time.
            </p>
          </div>
        </div>

        {activeRecords.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
            <p>No active granted consents found. Review available notices below to grant consent.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {rec.business?.name || 'Data Fiduciary'}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{rec.notice?.title}</h3>
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ACTIVE</span>
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Granted Purpose Choices:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(rec.choices || {}).map(([key, val]) => (
                      <span
                        key={key}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          val
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-slate-900 text-slate-500 border border-slate-800 line-through'
                        }`}
                      >
                        {key}: {val ? 'YES' : 'NO'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400 bg-slate-900 p-2 rounded-xl border border-slate-800/80 truncate">
                  <Hash className="w-3 h-3 flex-shrink-0 text-emerald-400" />
                  <span className="truncate">{rec.hash || rec.auditLogs?.[0]?.currentHash}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Granted: {new Date(rec.createdAt).toLocaleDateString()}</span>
                  </div>

                  <button
                    disabled={revokingId === rec.id}
                    onClick={() => handleRevoke(rec.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30 transition-all flex items-center space-x-1.5"
                  >
                    {revokingId === rec.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>1-Tap Revoke</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revoked Consents Section */}
      {revokedRecords.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Revoked Consent Records ({revokedRecords.length})</span>
          </h2>

          <div className="space-y-3">
            {revokedRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      REVOKED
                    </span>
                    <span className="font-bold text-slate-200">{rec.notice?.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Fiduciary: {rec.business?.name} | Revoked at: {new Date(rec.revokedAt || rec.updatedAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2 font-mono text-[11px] text-purple-400 bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                  <Hash className="w-3.5 h-3.5 text-purple-400" />
                  <span className="truncate max-w-xs">{rec.hash || rec.auditLogs?.[0]?.currentHash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
