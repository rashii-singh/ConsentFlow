'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Hash,
  Clock,
  AlertCircle,
  RefreshCw,
  History,
  AlertTriangle,
  Building2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface ConsumerConsentListProps {
  initialRecords: any[];
}

export default function ConsumerConsentList({ initialRecords }: ConsumerConsentListProps) {
  const [records, setRecords] = useState<any[]>(initialRecords);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<any | null>(null);

  const handleRevoke = async (recordId: string) => {
    setRevokingId(recordId);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/consent/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, reason: 'User requested DPDP Section 6(4) 1-tap withdrawal' }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === recordId
              ? {
                  ...r,
                  granted: false,
                  revokedAt: json.data.revokedAt,
                  hash: json.data.hash,
                  auditLogs: [
                    {
                      id: `log_revoke_${Date.now()}`,
                      action: 'REVOKE',
                      previousHash: r.auditLogs?.[0]?.currentHash || null,
                      currentHash: json.data.hash,
                      timestamp: json.data.revokedAt,
                      payload: { action: 'REVOKE', reason: 'User requested DPDP Section 6(4) 1-tap withdrawal' },
                    },
                    ...(r.auditLogs || []),
                  ],
                }
              : r
          )
        );
      } else {
        setErrorMessage(json.error || 'Failed to revoke consent. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during revocation');
    } finally {
      setRevokingId(null);
    }
  };

  const activeRecords = records.filter((r) => r.granted);
  const revokedRecords = records.filter((r) => !r.granted);

  return (
    <div className="space-y-8">
      
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Consents Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Active Granted Consents ({activeRecords.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Consents currently active and shared with Data Fiduciaries. You may revoke consent at any time under DPDP Section 6(4).
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
            {activeRecords.map((rec) => {
              const currentHash = rec.auditLogs?.[0]?.currentHash || rec.hash || 'sha256_hash_chained';
              return (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {rec.business?.name || 'Data Fiduciary'}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1.5">{rec.notice?.title}</h3>
                      </div>
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
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

                    <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 truncate">
                      <Hash className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                      <span className="truncate">{currentHash}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setSelectedAuditRecord(rec)}
                      className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Audit History ({rec.auditLogs?.length || 1})</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        disabled={revokingId === rec.id}
                        onClick={() => handleRevoke(rec.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30 transition-all flex items-center space-x-1.5 active:scale-95"
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Revoked Consents Section */}
      {revokedRecords.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Revoked Consent Records ({revokedRecords.length})</span>
          </h2>

          <div className="space-y-3">
            {revokedRecords.map((rec) => {
              const currentHash = rec.auditLogs?.[0]?.currentHash || rec.hash || 'sha256_hash_chained';
              return (
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

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 font-mono text-[11px] text-purple-400 bg-slate-900 p-2 rounded-xl border border-slate-800/80 truncate max-w-xs">
                      <Hash className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span className="truncate">{currentHash}</span>
                    </div>

                    <button
                      onClick={() => setSelectedAuditRecord(rec)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono flex items-center space-x-1"
                    >
                      <History className="w-3 h-3 text-purple-400" />
                      <span>History</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Citizen Audit Trail History Modal */}
      {selectedAuditRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-6 shadow-2xl animate-fadeIn text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  <Hash className="w-3 h-3" />
                  <span>Immutable SHA-256 Chained History</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {selectedAuditRecord.notice?.title || 'Consent Audit Trail'}
                </h3>
              </div>

              <button
                onClick={() => setSelectedAuditRecord(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Record ID:</span>
                  <span className="text-slate-200 font-bold">{selectedAuditRecord.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Data Fiduciary:</span>
                  <span className="text-cyan-400 font-bold">{selectedAuditRecord.business?.name}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Chained Audit Log Entries:
                </h4>

                {(selectedAuditRecord.auditLogs || []).map((log: any, idx: number) => (
                  <div
                    key={log.id || idx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'GRANT'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        #{idx + 1} {log.action}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">Current Block SHA-256 Hash:</div>
                      <div className="text-emerald-300 truncate font-bold bg-slate-900 p-2 rounded-xl border border-slate-800">
                        {log.currentHash}
                      </div>
                    </div>

                    {log.previousHash && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500">Previous Hash Link:</div>
                        <div className="text-slate-400 truncate bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                          {log.previousHash}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <Link
                href="/consumer/grievances"
                className="text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center space-x-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>File DPDP Grievance Against This Fiduciary</span>
              </Link>

              <button
                onClick={() => setSelectedAuditRecord(null)}
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Close Audit History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
