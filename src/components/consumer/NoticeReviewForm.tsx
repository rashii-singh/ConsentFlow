'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SimplifiedConsentCard from '@/components/ai/SimplifiedConsentCard';
import {
  ShieldCheck,
  CheckSquare,
  Square,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Building2,
  Layers,
} from 'lucide-react';

interface NoticePurpose {
  id: string;
  name: string;
  description: string;
  required: boolean;
  defaultOn?: boolean;
}

interface NoticeReviewFormProps {
  notice: {
    id: string;
    title: string;
    rawLegalText: string;
    purposes: any[];
    business: {
      id: string;
      name: string;
      tier: string;
    };
  };
}

export default function NoticeReviewForm({ notice }: NoticeReviewFormProps) {
  const router = useRouter();

  // Normalize purposes array
  const rawPurposes: NoticePurpose[] =
    Array.isArray(notice.purposes) && notice.purposes.length > 0
      ? notice.purposes
      : [
          {
            id: 'p_core',
            name: 'Essential Service Provision',
            description: 'Necessary data processing to deliver core service features.',
            required: true,
            defaultOn: true,
          },
          {
            id: 'p_analytics',
            name: 'Usage Analytics & Performance',
            description: 'Anonymous data collection to optimize app reliability.',
            required: false,
            defaultOn: false,
          },
          {
            id: 'p_marketing',
            name: 'Personalized Offers & Newsletters',
            description: 'Custom promotional updates and discount notifications.',
            required: false,
            defaultOn: false,
          },
        ];

  // Initialize granular choices (essential locked ON, optional default OFF)
  const initialChoices: Record<string, boolean> = {};
  rawPurposes.forEach((p) => {
    initialChoices[p.id] = p.required ? true : Boolean(p.defaultOn);
  });

  const [choices, setChoices] = useState<Record<string, boolean>>(initialChoices);
  const [understood, setUnderstood] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successHash, setSuccessHash] = useState<string | null>(null);

  const toggleChoice = (purposeId: string, required: boolean) => {
    if (required) return; // Locked ON for essential purposes
    setChoices((prev) => ({
      ...prev,
      [purposeId]: !prev[purposeId],
    }));
  };

  const handleGrant = async () => {
    if (!understood) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/consent/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeId: notice.id,
          choices,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to grant consent');
      }

      setSuccessHash(json.data.hash);
      setTimeout(() => {
        router.push('/consumer');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* AI Simplified Consent Notice Card */}
      <SimplifiedConsentCard
        noticeId={notice.id}
        title={notice.title}
        rawLegalText={notice.rawLegalText}
      />

      {/* Granular Purpose Choices Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="space-y-1 border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>DPDP Granular Purpose Choices</span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure your consent preferences below. Essential processing is locked required by the service.
          </p>
        </div>

        <div className="space-y-4">
          {rawPurposes.map((p) => {
            const isChecked = choices[p.id] ?? false;
            return (
              <div
                key={p.id}
                onClick={() => toggleChoice(p.id, p.required)}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  p.required
                    ? 'bg-slate-950/60 border-slate-800 cursor-not-allowed'
                    : isChecked
                    ? 'bg-slate-950 border-emerald-500/40 cursor-pointer hover:border-emerald-500/60'
                    : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 cursor-pointer'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-200">{p.name}</span>
                    {p.required ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-[10px] font-bold border border-slate-700">
                        <Lock className="w-3 h-3" />
                        <span>ESSENTIAL (LOCKED ON)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 uppercase">OPTIONAL</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                </div>

                {/* Custom Toggle Box */}
                <div className="pt-1 flex-shrink-0">
                  <div
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                      isChecked ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-slate-950 shadow-md transition-transform transform ${
                        isChecked ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explicit "I Understand" Checkbox & Grant Gate */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-6 shadow-2xl">
        <div
          onClick={() => setUnderstood(!understood)}
          className="flex items-start space-x-3 cursor-pointer group select-none"
        >
          <div className="pt-0.5 flex-shrink-0">
            {understood ? (
              <CheckSquare className="w-6 h-6 text-emerald-400 group-hover:scale-105 transition-transform" />
            ) : (
              <Square className="w-6 h-6 text-slate-600 group-hover:text-slate-400 transition-colors" />
            )}
          </div>
          <div className="space-y-1">
            <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
              I have read and understood the plain-language notice and data processing purposes under DPDP Act 2023.
            </span>
            <p className="text-xs text-slate-400">
              By checking this box, you confirm your statutory informed consent to {notice.business?.name}.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successHash && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1 animate-fadeIn">
            <div className="flex items-center space-x-2 font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Consent Granted & Cryptographically Audit-Chained!</span>
            </div>
            <div className="font-mono text-[11px] text-emerald-300/80 truncate">
              SHA-256 Hash: {successHash}
            </div>
          </div>
        )}

        <button
          disabled={!understood || submitting}
          onClick={handleGrant}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-xl ${
            understood && !submitting
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.99]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Writing Cryptographic Audit Entry...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Grant Informed Consent</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
