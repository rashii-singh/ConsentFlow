'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/ai/prompts';

interface LanguageSelectorProps {
  selectedLang: string;
  onSelectLang: (lang: SupportedLanguage) => void;
  disabled?: boolean;
}

export default function LanguageSelector({
  selectedLang,
  onSelectLang,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Languages className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((langKey) => {
          const isSelected = selectedLang === langKey;
          return (
            <button
              key={langKey}
              type="button"
              disabled={disabled}
              onClick={() => onSelectLang(langKey)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {SUPPORTED_LANGUAGES[langKey]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
