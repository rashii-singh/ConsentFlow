'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, Hash, User, Building2, ArrowRight, CheckCircle2, Clock, X } from 'lucide-react';

interface RegulatorSearchFeedProps {
  initialRecords: any[];
}

export default function RegulatorSearchFeed({ initialRecords }: RegulatorSearchFeedProps) {
  const [query, setQuery] = useState('');

  const filteredRecords = initialRecords.filter((rec) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    return (
      rec.id.toLowerCase().includes(q) ||
      rec.user?.email?.toLowerCase().includes(q) ||
      rec.user?.name?.toLowerCase().includes(q) ||
      rec.business?.name?.toLowerCase().includes(q) ||
      rec.notice?.title?.toLowerCase().includes(q) ||
      (rec.auditLogs?.[0]?.currentHash && rec.auditLogs[0].currentHash.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Real-Time Search Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Search className="w-5 h-5 text-purple-400" />
              <span>Search Fiduciary Consent Logs</span>
            </h2>
            <p className="text-xs text-slate-400">
              Filter by Consent Record ID, Data Principal Email, Fiduciary Name, or SHA-256 Hash.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-400">
            {filteredRecords.length} / {initialRecords.length} Records Found
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email (e.g. consumer@demo.com), Record ID, or SHA-256 Hash..."
            className="w-full py-3 pl-11 pr-10 rounded-2xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Record Cards Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRecords.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono space-y-3">
            <p>No matching consent records found for query "{query}".</p>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold transition-colors"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          filteredRecords.map((rec) => {
            const currentHash = rec.auditLogs?.[0]?.currentHash || rec.hash || 'sha256_hash_chained';
            return (
              <div
                key={rec.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all space-y-4 shadow-xl flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      ID: {rec.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                        rec.granted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {rec.granted ? 'ACTIVE GRANT' : 'REVOKED'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {rec.notice?.title || 'Fiduciary Consent Notice'}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{rec.user?.email || rec.userId}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{rec.business?.name || 'Fiduciary'}</span>
                      </span>
                    </div>
                  </div>

                  {/* SHA-256 Hash Display */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1 font-mono text-[11px]">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      SHA-256 Chained Hash:
                    </div>
                    <div className="text-purple-300 truncate font-bold">
                      {currentHash}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <span className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                  </span>

                  <Link
                    href={`/regulator/verify/${rec.id}`}
                    className="py-2 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30 transition-all flex items-center space-x-1.5 group-hover:bg-purple-500 group-hover:text-slate-950"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Hash Chain</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
