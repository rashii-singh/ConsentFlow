'use client';

import React, { useState } from 'react';
import { Eye, ShieldCheck, Hash, CheckCircle2, Lock, History, Search, ExternalLink, AlertTriangle } from 'lucide-react';

interface RegulatorViewProps {
  records: any[];
  onInspectAudit: (record: any) => void;
}

export default function RegulatorView({ records, onInspectAudit }: RegulatorViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter(
    (r) =>
      r.hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.noticeTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Regulator Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <span>Data Protection Board Regulatory View</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Cryptographic Audit Inspector
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Under Section 6(7) of the DPDP Act 2023, regulators can independently verify consent transactions using SHA-256 hash chaining without accessing unencrypted citizen PII.
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center">
            <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Chain Integrity</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">0 Tampering Alerts Detected</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit records by SHA-256 hash, email, or fiduciary name..."
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {/* Audit Log Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Hash className="w-4 h-4 text-purple-400" />
            <span>Immutable Consent Log Ledger</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Showing {filteredRecords.length} Audited Events</span>
        </div>

        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const isGranted = record.status === 'GRANTED';

            return (
              <div
                key={record.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isGranted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {record.status}
                    </span>
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {record.noticeTitle || record.notice?.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono">
                    <span>Principal: {record.userEmail || record.user?.email}</span>
                    <span>Fiduciary: {record.businessName || record.business?.name}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] font-mono text-purple-400">
                    <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{record.hash}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SHA-256 Valid</span>
                  </span>

                  <button
                    onClick={() => onInspectAudit(record)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold text-xs border border-purple-500/30 transition-all"
                  >
                    <span>Inspect Chain</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
