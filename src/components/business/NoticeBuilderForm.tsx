'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Lock, FileText } from 'lucide-react';

interface PurposeInput {
  id: string;
  name: string;
  description: string;
  required: boolean;
  defaultOn?: boolean;
}

export default function NoticeBuilderForm() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [rawLegalText, setRawLegalText] = useState('');
  const [purposes, setPurposes] = useState<PurposeInput[]>([
    {
      id: 'p_core',
      name: 'Essential Service Provision',
      description: 'Necessary processing to fulfill requested service under Section 6 of DPDP Act 2023.',
      required: true,
      defaultOn: true,
    },
    {
      id: 'p_marketing',
      name: 'Personalized Offers & Updates',
      description: 'Customized recommendations and promotional notifications.',
      required: false,
      defaultOn: false,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addPurpose = () => {
    const newId = `p_custom_${Date.now()}`;
    setPurposes([
      ...purposes,
      { id: newId, name: '', description: '', required: false, defaultOn: false },
    ]);
  };

  const removePurpose = (index: number) => {
    if (purposes[index].required) return; // Keep required purpose
    setPurposes(purposes.filter((_, i) => i !== index));
  };

  const updatePurpose = (index: number, field: keyof PurposeInput, value: any) => {
    const updated = [...purposes];
    updated[index] = { ...updated[index], [field]: value };
    setPurposes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !rawLegalText) return;

    setSubmitting(true);
    setSuccessMsg(false);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/business/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          rawLegalText,
          purposes,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSuccessMsg(true);
        setTitle('');
        setRawLegalText('');
        router.refresh();
      } else {
        setErrorMessage(json.error || 'Failed to create notice');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while creating notice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/30 space-y-6 shadow-2xl"
    >
      <div className="space-y-1 border-b border-slate-800 pb-4">
        <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/30 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Groq AI Integrated Builder</span>
        </div>
        <h2 className="text-xl font-bold text-white">Create New Fiduciary Consent Notice</h2>
        <p className="text-xs text-slate-400">
          Submitting this notice will automatically trigger Groq Llama 3.1 8B AI summarization in English & Indic languages.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Notice Title */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Notice Title
        </label>
        <input
          type="text"
          required
          placeholder="e.g. HealthPlus Consultation Data Processing Notice"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
        />
      </div>

      {/* Raw Legal Text */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Dense Legal Privacy Notice Text
        </label>
        <textarea
          required
          rows={4}
          placeholder="Paste full formal legal privacy notice text under DPDP Act 2023 guidelines..."
          value={rawLegalText}
          onChange={(e) => setRawLegalText(e.target.value)}
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition-all leading-relaxed"
        />
      </div>

      {/* Purpose Configuration Builder */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Granular Data Processing Purposes
          </label>
          <button
            type="button"
            onClick={addPurpose}
            className="px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30 transition-all flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Purpose</span>
          </button>
        </div>

        <div className="space-y-3">
          {purposes.map((p, idx) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  required
                  placeholder="Purpose Name (e.g. Tele-consultation diagnostics)"
                  value={p.name}
                  onChange={(e) => updatePurpose(idx, 'name', e.target.value)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs font-bold text-slate-100 placeholder:text-slate-600 outline-none"
                />

                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={p.required}
                      disabled={idx === 0}
                      onChange={(e) => updatePurpose(idx, 'required', e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span className={p.required ? 'text-amber-400 font-bold' : ''}>Essential</span>
                  </label>

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removePurpose(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                required
                placeholder="Brief description of data collected for this purpose..."
                value={p.description}
                onChange={(e) => updatePurpose(idx, 'description', e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs text-slate-300 placeholder:text-slate-600 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Consent Notice Created! AI pre-summarization completed for English & Indic languages.</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-xl shadow-cyan-500/20 active:scale-[0.99]"
      >
        {submitting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            <span>Generating AI Summaries & Saving Notice...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Publish Notice & Generate AI Summaries</span>
          </>
        )}
      </button>
    </form>
  );
}
