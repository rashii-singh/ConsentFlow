'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Shield, UserCheck, Building2, Eye, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const handleDemoLogin = async (email: string, targetPath: string) => {
    setLoadingEmail(email);
    try {
      await signIn('credentials', {
        email,
        redirectTo: targetPath,
      });
    } catch (err) {
      console.error('Sign in error:', err);
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Consent<span className="text-emerald-400">Flow</span>
            </h1>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400 mt-1">
              DPDP Act 2023 Consent Manager
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Select a seeded demo account role below to authenticate and enter the role-protected environment.
          </p>
        </div>

        {/* Demo Account Cards */}
        <div className="space-y-4 bg-slate-900/90 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
          
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deterministic Demo Login Accounts</span>
          </div>

          {/* 1. Consumer */}
          <button
            disabled={!!loadingEmail}
            onClick={() => handleDemoLogin('consumer@demo.com', '/consumer')}
            className="w-full group p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200 text-left flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300">Ananya Sharma</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    CONSUMER
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">consumer@demo.com</p>
              </div>
            </div>
            {loadingEmail === 'consumer@demo.com' ? (
              <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            )}
          </button>

          {/* 2. Business */}
          <button
            disabled={!!loadingEmail}
            onClick={() => handleDemoLogin('business@demo.com', '/business')}
            className="w-full group p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-200 text-left flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300">Vikram Mehta</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    BUSINESS
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">business@demo.com</p>
              </div>
            </div>
            {loadingEmail === 'business@demo.com' ? (
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            )}
          </button>

          {/* 3. Regulator */}
          <button
            disabled={!!loadingEmail}
            onClick={() => handleDemoLogin('regulator@demo.com', '/regulator')}
            className="w-full group p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all duration-200 text-left flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300">DPDP Regulator</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    REGULATOR
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">regulator@demo.com</p>
              </div>
            </div>
            {loadingEmail === 'regulator@demo.com' ? (
              <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            )}
          </button>

        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Role stored in JWT & Server-protected sessions</span>
        </div>

      </div>

    </div>
  );
}
