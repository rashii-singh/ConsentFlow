'use client';

import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertTriangle, MessageSquare, Send, RefreshCw } from 'lucide-react';

interface BusinessGrievanceTableProps {
  initialGrievances: any[];
}

export default function BusinessGrievanceTable({ initialGrievances }: BusinessGrievanceTableProps) {
  const [grievances, setGrievances] = useState<any[]>(initialGrievances);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('IN_PROGRESS');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (ticketId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/grievances', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          status,
          resolutionNotes: notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setGrievances((prev) =>
          prev.map((g) => (g.id === ticketId ? { ...g, ...json.data } : g))
        );
        setEditingId(null);
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to resolve grievance:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Consumer Grievance Tickets ({grievances.length})</span>
          </h2>
          <p className="text-xs text-slate-400">
            DPDP Act 2023 statutory 30-day resolution queue. Update ticket status and record official resolution notes.
          </p>
        </div>
      </div>

      {grievances.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-mono">
          No active consumer grievances logged.
        </div>
      ) : (
        <div className="space-y-4">
          {grievances.map((g) => {
            const isEditing = editingId === g.id;
            return (
              <div
                key={g.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Ticket ID: {g.id} | Data Principal: {g.user?.email || g.userId}
                    </span>
                    <h3 className="text-sm font-bold text-white">{g.subject}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        g.status === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : g.status === 'IN_PROGRESS'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {g.status}
                    </span>

                    <button
                      onClick={() => {
                        setEditingId(isEditing ? null : g.id);
                        setStatus(g.status);
                        setNotes(g.resolutionNotes || '');
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                    >
                      {isEditing ? 'Cancel Edit' : 'Update Status'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {g.description}
                </p>

                {g.resolutionNotes && !isEditing && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1 font-mono">
                    <div className="font-bold text-emerald-400 text-[10px]">
                      Recorded Resolution Notes:
                    </div>
                    <p>"{g.resolutionNotes}"</p>
                  </div>
                )}

                {/* Inline Status & Notes Editor */}
                {isEditing && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase">Set Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 outline-none"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase">Resolution Notes</label>
                        <input
                          type="text"
                          placeholder="Provide details on action taken..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      disabled={saving}
                      onClick={() => handleUpdate(g.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                    >
                      {saving ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Save Grievance Resolution</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
