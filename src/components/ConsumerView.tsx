'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, Hash, History, RefreshCw, FileText, Building } from 'lucide-react';

interface ConsumerViewProps {
  records: any[];
  onToggleConsent: (recordId: string, currentStatus: string, noticeId: string, businessId: string) => void;
  onInspectAudit: (record: any) => void;
  loadingRecordId: string | null;
}

export default function ConsumerView({ records, onToggleConsent, onInspectAudit, loadingRecordId }: ConsumerViewProps) {
  const [filter, setFilter] = useState<'ALL' | 'GRANTED' | 'REVOKED'>('ALL');

  const filteredRecords = records.filter((r) => {
    if (filter === 'GRANTED') return r.status === 'GRANTED';
    if (filter === 'REVOKED') return r.status === 'REVOKED';
    return true;
  });

  const activeGrantedCount = records.filter((r) => r.status === 'GRANTED').length;
  const revokedCount = records.filter((r) => r.status === 'REVOKED').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Consumer Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Data Principal (Citizen Portal)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ananya Sharma <span className="text-slate-500 font-normal text-xl">(consumer@demo.com)</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Under Section 6 of the DPDP Act 2023, you have full real-time control over which Data Fiduciaries can process your personal information.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center">
              <div className="text-2xl font-black text-emerald-400">{activeGrantedCount}</div>
              <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Active Consents</div>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-slate-950/80 border border-rose-500/30 text-center">
              <div className="text-2xl font-black text-rose-400">{revokedCount}</div>
              <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Revoked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Notices ({records.length})
          </button>
          <button
            onClick={() => setFilter('GRANTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'GRANTED'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Consents ({activeGrantedCount})
          </button>
          <button
            onClick={() => setFilter('REVOKED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'REVOKED'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Revoked ({revokedCount})
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center space-x-1">
          <Hash className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cryptographic Hash Chaining Enabled</span>
        </div>
      </div>

      {/* Consent Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecords.map((record) => {
          const isGranted = record.status === 'GRANTED';
          const isRevoked = record.status === 'REVOKED';
          const isLoading = loadingRecordId === record.id;
          const notice = record.notice || { title: record.noticeTitle, description: '', purpose: '', dataTypes: record.dataTypesShared };
          const business = record.business || { name: record.businessName || 'Data Fiduciary', domain: '' };

          return (
            <div
              key={record.id}
              className={`group relative rounded-3xl p-6 transition-all duration-300 border ${
                isGranted
                  ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/60 shadow-xl shadow-emerald-950/20'
                  : 'bg-slate-900/40 border-rose-500/30 hover:border-rose-500/50 opacity-90'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl ${isGranted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {business.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{business.domain || 'DPDP Verified Fiduciary'}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                    isGranted
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40'
                      : isRevoked
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {isGranted ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{record.status}</span>
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-5">
                <h4 className="text-base font-semibold text-slate-100 line-clamp-2">
                  {notice.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {notice.description || notice.purpose || 'Authorized purpose under DPDP Act Section 6.'}
                </p>
              </div>

              {/* Shared Data Types */}
              <div className="mb-6">
                <div className="text-[11px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                  Data Types Shared:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(record.dataTypesShared && record.dataTypesShared.length > 0 ? record.dataTypesShared : notice.dataTypes || []).map((type: string, idx: number) => (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                        isGranted
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/20'
                          : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                      }`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* SHA-256 Hash Preview */}
              <div className="mb-6 p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate mr-2">
                  <Hash className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate text-slate-300">
                    {record.hash ? `${record.hash.substring(0, 16)}...${record.hash.substring(record.hash.length - 8)}` : 'Generating hash...'}
                  </span>
                </div>
                <button
                  onClick={() => onInspectAudit(record)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline flex-shrink-0"
                >
                  Verify Audit
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onInspectAudit(record)}
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>View History Log</span>
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => onToggleConsent(record.id, record.status, record.noticeId, record.businessId)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isGranted
                      ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isGranted ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Revoke Consent</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Grant Consent</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
