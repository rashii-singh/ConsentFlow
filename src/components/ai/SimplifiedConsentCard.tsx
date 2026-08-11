'use client';

import React, { useState, useEffect } from 'react';
import LanguageSelector from './LanguageSelector';
import { SupportedLanguage } from '@/lib/ai/prompts';
import { Sparkles, Clock, CheckCircle2, RefreshCw, FileText, AlertCircle } from 'lucide-react';

interface SimplifiedConsentCardProps {
  noticeId?: string;
  title: string;
  rawLegalText: string;
  defaultLang?: SupportedLanguage;
}

export default function SimplifiedConsentCard({
  noticeId,
  title,
  rawLegalText,
  defaultLang = 'en',
}: SimplifiedConsentCardProps) {
  const [lang, setLang] = useState<SupportedLanguage>(defaultLang);
  const [loading, setLoading] = useState<boolean>(false);
  const [simplifiedData, setSimplifiedData] = useState<{
    simplified: string;
    keyPoints: string[];
    readingTime: string;
  } | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [model, setModel] = useState<string>('llama-3.1-8b-instant');
  const [showRaw, setShowRaw] = useState<boolean>(false);

  const fetchSimplification = async (targetLang: SupportedLanguage) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawLegalText,
          lang: targetLang,
          noticeId,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSimplifiedData(json.data);
        setIsFallback(json.isFallback || false);
        setModel(json.model || 'llama-3.1-8b-instant');
      }
    } catch (err) {
      console.error('Failed to fetch AI simplification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimplification(lang);
  }, [lang, rawLegalText]);

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 animate-fadeIn">
      
      {/* Header & Language Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/30 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Groq AI Simplifier</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">DPDP Sec 6 Plain Language</span>
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        <LanguageSelector
          selectedLang={lang}
          onSelectLang={(newLang) => setLang(newLang)}
          disabled={loading}
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">
            Translating & Simplifying Legal Text into {lang.toUpperCase()} via Llama 3.1 8B...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* AI Simplified Summary */}
          {simplifiedData && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Plain Language Summary ({lang.toUpperCase()})</span>
                </span>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{simplifiedData.readingTime} read</span>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                "{simplifiedData.simplified}"
              </p>

              {/* Key Bullet Points */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Key Privacy Points:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {simplifiedData.keyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Model Status & Raw Text Toggle Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Model: {model}
              </span>
              {isFallback && (
                <span className="text-amber-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>(Fallback Engine)</span>
                </span>
              )}
            </div>

            <button
              onClick={() => setShowRaw(!showRaw)}
              className="hover:text-purple-300 flex items-center space-x-1 text-slate-400"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showRaw ? 'Hide Raw Legal Text' : 'View Dense Legal Text'}</span>
            </button>
          </div>

          {/* Raw Legal Text Expandable Box */}
          {showRaw && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-2 animate-fadeIn">
              <div className="font-bold text-slate-300">Original Legal Notice Text:</div>
              <p className="leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                {rawLegalText}
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
