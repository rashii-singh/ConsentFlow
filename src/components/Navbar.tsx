'use client';

import React from 'react';
import { Shield, Users, Building2, Eye, Database, RefreshCw, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeRole: 'CONSUMER' | 'BUSINESS' | 'REGULATOR' | 'SEED_VIEW';
  setActiveRole: (role: 'CONSUMER' | 'BUSINESS' | 'REGULATOR' | 'SEED_VIEW') => void;
  seedCounts?: { users: number; businesses: number; notices: number; consentRecords: number };
}

export default function Navbar({ activeRole, setActiveRole, seedCounts }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-emerald-500/20 shadow-lg shadow-emerald-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveRole('CONSUMER')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30 animate-glow">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white font-sans">
                  Consent<span className="text-emerald-400">Flow</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  DPDP 2023
                </span>
              </div>
              <p className="text-xs text-slate-400">Real-time Consent Manager Platform</p>
            </div>
          </div>

          {/* Role Navigation Switcher */}
          <div className="hidden md:flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveRole('CONSUMER')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeRole === 'CONSUMER'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Consumer (Data Principal)</span>
            </button>

            <button
              onClick={() => setActiveRole('BUSINESS')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeRole === 'BUSINESS'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Business (Data Fiduciary)</span>
            </button>

            <button
              onClick={() => setActiveRole('REGULATOR')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeRole === 'REGULATOR'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Regulator (Audit Trail)</span>
            </button>

            <button
              onClick={() => setActiveRole('SEED_VIEW')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeRole === 'SEED_VIEW'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Seed Inspector</span>
            </button>
          </div>

          {/* Seed Verification Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-900 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400">
                Seed Active ({seedCounts?.consentRecords || 5} Records)
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
