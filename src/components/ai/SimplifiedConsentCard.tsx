'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, CheckCircle2, Globe, FileText, RefreshCw, AlertCircle, Eye } from 'lucide-react';

interface SimplifiedData {
  simplified: string;
  keyPoints: string[];
  readingTime: string;
}

interface SimplifiedConsentCardProps {
  noticeId: string;
  title: string;
  rawLegalText: string;
}

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
];

export default function SimplifiedConsentCard({
  noticeId,
  title,
  rawLegalText,
}: SimplifiedConsentCardProps) {
  const [selectedLang, setSelectedLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SimplifiedData | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimplifiedText = async (lang: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawLegalText,
          lang,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || 'Failed to simplify text');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching AI translation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimplifiedText(selectedLang);
  }, [selectedLang]);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-6 shadow-2xl relative overflow-hidden">
      
      {/* Header Bar with Language Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
            <Sparkles className="w-3 h-3" />
            <span>AI Plain-Language Simplifier (Groq Llama 3.1 8B)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        </div>

        {/* 5-Language Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 self-start sm:self-auto flex-wrap gap-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLang === lang.code
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{lang.native}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Simplified Content Body */}
      {loading ? (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs text-slate-400 font-mono">
            Translating & simplifying legal clauses using Groq Llama 3.1...
          </p>
        </div>
      ) : data ? (
        <div className="space-y-5 animate-fadeIn">
          {/* Summary Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold uppercase text-[10px]">Plain-Language Summary:</span>
              <span className="inline-flex items-center space-x-1 text-slate-500">
                <Clock className="w-3 h-3" />
                <span>Reading Time: {data.readingTime || '30s'}</span>
              </span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-relaxed font-sans">
              {data.simplified}
            </p>
          </div>

          {/* Key Takeaways Checklist */}
          {data.keyPoints && data.keyPoints.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Key Highlights What You Agree To:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {data.keyPoints.map((point, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center space-x-2 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Raw Legal Text Comparison Toggle */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors flex items-center space-x-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showRaw ? 'Hide Raw Legal Text' : 'View Original Statutory Legal Text'}</span>
        </button>

        {showRaw && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 leading-relaxed max-h-48 overflow-y-auto animate-fadeIn">
            {rawLegalText}
          </div>
        )}
      </div>

    </div>
  );
}
