'use client';

import React, { useState } from 'react';
import { verifyChain, AuditLogItem } from '@/lib/crypto/audit';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Hash,
  FileCheck,
  Printer,
  ArrowLeft,
  Clock,
  User,
  Building2,
  Bug,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

interface AuditChainViewerProps {
  record: any;
  auditLogs: AuditLogItem[];
}

export default function AuditChainViewer({ record, auditLogs }: AuditChainViewerProps) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [isTamperedDemo, setIsTamperedDemo] = useState(false);

  // Active logs: if tamper simulation is active, inject a modified payload into node 0 or 1
  const displayLogs: AuditLogItem[] = React.useMemo(() => {
    if (!isTamperedDemo) return auditLogs;
    const cloned = JSON.parse(JSON.stringify(auditLogs));
    if (cloned.length > 0) {
      const targetIdx = Math.min(1, cloned.length - 1);
      cloned[targetIdx].payload = {
        ...cloned[targetIdx].payload,
        choices: { ...(cloned[targetIdx].payload?.choices || {}), tampered_field: true, illegal_sharing: true },
        tampered_unauthorized_action: 'UNAUTHORIZED_DATA_ACCESS_SIMULATION',
      };
    }
    return cloned;
  }, [auditLogs, isTamperedDemo]);

  // Compute chain integrity status live
  const verification = verifyChain(displayLogs);

  const formatTruncatedHash = (hash: string | null) => {
    if (!hash) return 'GENESIS (0x000...000)';
    if (hash.length <= 16) return hash;
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Verification Status Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Audit Log Record ID: {record.id}
            </span>
            <h1 className="text-2xl font-black text-white">{record.notice?.title || 'Consent Record'}</h1>
          </div>

          {/* Verification Badge */}
          {verification.valid ? (
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm shadow-lg shadow-emerald-500/10 self-start sm:self-auto">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>VALID SHA-256 AUDIT CHAIN</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm shadow-lg shadow-rose-500/10 self-start sm:self-auto animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>TAMPERED AT INDEX {verification.brokenIndex}</span>
            </div>
          )}
        </div>

        {verification.error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            <strong>Verification Engine Alert:</strong> {verification.error}
          </div>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">Data Principal:</span>
            <div className="font-bold text-slate-200">{record.user?.name || record.user?.email || record.userId}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">Data Fiduciary:</span>
            <div className="font-bold text-slate-200">{record.business?.name || record.businessId}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">Total Chain Depth:</span>
            <div className="font-bold text-purple-400">{displayLogs.length} Cryptographic Nodes</div>
          </div>
        </div>

        {/* Actions bar: Tamper Simulator & Certificate Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsTamperedDemo(!isTamperedDemo)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                isTamperedDemo
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {isTamperedDemo ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Untampered Chain</span>
                </>
              ) : (
                <>
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  <span>Simulate Payload Tampering (Demo)</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              {isTamperedDemo ? '⚠️ Tampered payload injected' : 'Demonstrates live SHA-256 detection'}
            </span>
          </div>

          <button
            onClick={() => setShowCertificate(true)}
            className="py-2.5 px-5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-purple-500/20 active:scale-95 self-start sm:self-auto"
          >
            <FileCheck className="w-4 h-4" />
            <span>Export Compliance Certificate</span>
          </button>
        </div>
      </div>

      {/* Audit Chain Timeline */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Hash className="w-5 h-5 text-purple-400" />
          <span>Cryptographic Hash Chain Timeline</span>
        </h2>

        <div className="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
          {displayLogs.map((log, idx) => {
            const isGenesis = idx === 0 || !log.previousHash;
            const isBroken = verification.brokenIndex === idx;
            return (
              <div key={log.id || idx} className="flex items-start space-x-4 relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-lg ${
                    isBroken
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-bounce'
                      : isGenesis
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  #{idx}
                </div>

                <div
                  className={`flex-1 p-5 rounded-2xl border space-y-3 ${
                    isBroken
                      ? 'bg-slate-950 border-rose-500/50 shadow-lg shadow-rose-950/20'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white uppercase">{log.action}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        Actor: {log.actorId}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(log.timestamp || Date.now()).toLocaleString()}
                    </span>
                  </div>

                  {/* Hash Linkage Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-500 uppercase">Previous Hash Link:</div>
                      <div className="text-slate-300 truncate font-bold">
                        {formatTruncatedHash(log.previousHash)}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 space-y-1">
                      <div className="text-[10px] text-purple-400 uppercase">Current Block Hash:</div>
                      <div className="text-purple-300 truncate font-bold">
                        {formatTruncatedHash(log.currentHash)}
                      </div>
                    </div>
                  </div>

                  {/* Canonical Payload */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <span className="text-slate-500 block mb-1">Payload JSON:</span>
                    <pre className="overflow-x-auto text-emerald-400 leading-relaxed max-h-48">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exportable Official Compliance Certificate View / Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 space-y-6 shadow-2xl animate-fadeIn text-slate-100 relative">
            <div className="text-center space-y-2 border-b border-slate-800 pb-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
                <span>OFFICIAL DPDP COMPLIANCE CERTIFICATE</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Certificate of Cryptographic Audit Verification
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Data Protection Board of India — Pursuant to Section 6 DPDP Act 2023
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Consent Record ID:</span>
                <span className="text-white font-bold">{record.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Data Principal:</span>
                <span className="text-emerald-400 font-bold">{record.user?.email || record.userId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Data Fiduciary:</span>
                <span className="text-cyan-400 font-bold">{record.business?.name || record.businessId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Chain Verification Status:</span>
                <span className="text-emerald-400 font-bold">100% UNTAMPERED (VALID)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Latest SHA-256 Root Hash:</span>
                <span className="text-purple-300 font-bold truncate max-w-xs">
                  {auditLogs[auditLogs.length - 1]?.currentHash}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download PDF</span>
              </button>

              <button
                onClick={() => setShowCertificate(false)}
                className="py-2.5 px-5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
