'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2,
  ShieldAlert,
  FileText,
  RefreshCw,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface BusinessItem {
  id: string;
  name: string;
}

interface ConsumerGrievanceViewProps {
  initialGrievances: any[];
  businesses: BusinessItem[];
}

function SLACountdown({ deadline }: { deadline: string }) {
  const diffMs = new Date(deadline).getTime() - Date.now();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const diffHours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  if (diffMs <= 0) {
    return (
      <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/30">
        SLA BREACHED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/30">
      <Clock className="w-3 h-3 text-amber-400" />
      <span>{diffDays}d {diffHours}h remaining</span>
    </span>
  );
}

export default function ConsumerGrievanceView({
  initialGrievances,
  businesses,
}: ConsumerGrievanceViewProps) {
  const [grievances, setGrievances] = useState<any[]>(initialGrievances);
  const [showForm, setShowForm] = useState(false);

  const [businessId, setBusinessId] = useState(businesses[0]?.id || '');
  const [type, setType] = useState('ACCESS');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: businessId || businesses[0]?.id,
          type,
          subject,
          description,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGrievances([json.data, ...grievances]);
        setSubject('');
        setDescription('');
        setShowForm(false);
        setSuccessMessage('Grievance ticket filed successfully! Statutory 30-day SLA countdown initiated.');
      } else {
        setErrorMessage(json.error || 'Failed to file grievance ticket');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while filing grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* File Grievance Action Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>DPDP Statutory Grievance Redressal</span>
          </h2>
          <p className="text-xs text-slate-400">
            Section 13 mandates Data Fiduciaries must resolve grievances within 30 days of filing.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setErrorMessage(null);
          }}
          className="py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{showForm ? 'Cancel Filing' : 'File New Grievance Ticket'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grievance Filing Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl animate-fadeIn"
        >
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">File Formal Complaint Ticket</h3>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              DPDP Act 2023 Section 13
            </span>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Target Data Fiduciary
              </label>
              <select
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 outline-none"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Grievance Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 outline-none"
              >
                <option value="ACCESS">Right to Access Personal Data (Section 11)</option>
                <option value="ERASURE">Right to Erasure & Deletion (Section 12)</option>
                <option value="CORRECTION">Right to Correction & Updating (Section 12)</option>
                <option value="NOMINATION">Right to Nominate Representative (Section 14)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Subject Summary
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Failure to stop promotional SMS after consent revocation"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Detailed Description & Evidence
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the non-compliance incident and requested resolution..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 outline-none leading-relaxed font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Submit Grievance & Start 30-Day SLA Clock</span>
          </button>
        </form>
      )}

      {/* Submitted Grievance Tickets List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>My Filed Complaints ({grievances.length})</span>
        </h2>

        {grievances.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-mono">
            No active grievances filed. Click "File New Grievance Ticket" above to register a complaint.
          </div>
        ) : (
          <div className="space-y-4">
            {grievances.map((g) => (
              <div
                key={g.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      Target: {g.business?.name || 'Data Fiduciary'}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{g.type}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <SLACountdown deadline={g.slaDeadline} />
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        g.status === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : g.status === 'IN_PROGRESS'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : g.status === 'ESCALATED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                  {g.description}
                </p>

                {(g.resolution || g.resolutionNotes) && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-1 font-mono">
                    <span className="font-bold text-emerald-400 uppercase text-[10px]">
                      Fiduciary Resolution Notes ({new Date(g.resolvedAt || g.updatedAt || Date.now()).toLocaleDateString()}):
                    </span>
                    <p>"{g.resolution || g.resolutionNotes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
