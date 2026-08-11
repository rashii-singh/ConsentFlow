'use client';

import React, { useState } from 'react';
import { Building2, FileCheck, Zap, ShieldCheck, AlertCircle, Plus, Globe, Mail, CheckCircle, Radio } from 'lucide-react';

interface BusinessViewProps {
  businesses: any[];
  notices: any[];
  records: any[];
}

export default function BusinessView({ businesses, notices, records }: BusinessViewProps) {
  const [selectedBiz, setSelectedBiz] = useState<string>(businesses[0]?.id || 'biz_01');

  const currentBiz = businesses.find((b) => b.id === selectedBiz) || businesses[0] || {
    name: 'HealthPlus Care',
    domain: 'healthplus.in',
    industry: 'Healthcare & Telemedicine',
    registrationNo: 'DPDP-BIZ-HLT-001',
    contactEmail: 'privacy@healthplus.in',
  };

  const bizNotices = notices.filter((n) => n.businessId === selectedBiz || n.business?.id === selectedBiz);
  const bizRecords = records.filter((r) => r.businessId === selectedBiz || r.business?.id === selectedBiz);

  const activeConsentCount = bizRecords.filter((r) => r.granted || r.status === 'GRANTED').length;
  const revokedConsentCount = bizRecords.filter((r) => (!r.granted && r.granted !== undefined) || r.status === 'REVOKED').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Business Switcher & Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Data Fiduciary Portal (Business Compliance)</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <span>{currentBiz.name}</span>
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                {currentBiz.registrationNo}
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentBiz.domain}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentBiz.contactEmail}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Industry: {currentBiz.industry}
              </span>
            </div>
          </div>

          {/* Business Select Switcher */}
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            {businesses.map((biz) => (
              <button
                key={biz.id}
                onClick={() => setSelectedBiz(biz.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedBiz === biz.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {biz.name}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{activeConsentCount}</div>
            <div className="text-xs text-slate-400 font-medium">Active Granted Consents</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{revokedConsentCount}</div>
            <div className="text-xs text-slate-400 font-medium">Revoked Consents</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{bizNotices.length}</div>
            <div className="text-xs text-slate-400 font-medium">Active Consent Notices</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">&lt; 50 ms</div>
            <div className="text-xs text-slate-400 font-medium">Webhook Sync Speed</div>
          </div>
        </div>
      </div>

      {/* Real-time Webhook Notification Simulation Banner */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-1">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Real-Time Webhook Engine</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Active Listening</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                When a Data Principal revokes consent on ConsentFlow, a signed SHA-256 HMAC payload automatically notifies{' '}
                <code className="text-cyan-300 font-mono">https://api.{currentBiz.domain}/webhooks/dpdp</code> to immediately purge or cease processing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Published Consent Notices Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Published Consent Notices</h2>
            <p className="text-xs text-slate-400">Notice templates drafted and active under DPDP Section 5 compliance rules.</p>
          </div>
          <button className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20">
            <Plus className="w-4 h-4" />
            <span>Draft New Notice</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {bizNotices.map((notice) => (
            <div key={notice.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-100">{notice.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{notice.description || notice.rawLegalText}</p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Active Notice
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs border-t border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Purpose:</span>
                  <span className="text-slate-300 font-medium">{notice.purpose}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">Data Scope:</span>
                  {(notice.dataTypes || []).map((dt: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {dt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
