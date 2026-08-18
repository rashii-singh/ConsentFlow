'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  UserCheck,
  Building2,
  Eye,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  Mail,
  RefreshCw,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl');

  const [emailInput, setEmailInput] = useState('');
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === 'CredentialsSignin'
      ? 'Authentication failed: Invalid credentials or unregistered email address.'
      : urlError
      ? `Authentication Error: ${urlError}`
      : null
  );

  const handleSignIn = async (email: string, targetPath?: string) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter an email address.');
      return;
    }

    setLoadingEmail(trimmedEmail);
    setErrorMessage(null);

    try {
      const res = await signIn('credentials', {
        email: trimmedEmail,
        redirect: false,
        callbackUrl: targetPath || callbackUrl || undefined,
      });

      if (!res || res.error) {
        setErrorMessage(
          'Authentication failed: Unregistered demo email. Please select one of the registered demo accounts below.'
        );
      } else if (res.ok) {
        // Redirect based on role or target path
        if (targetPath) {
          router.push(targetPath);
        } else if (callbackUrl) {
          router.push(callbackUrl);
        } else if (trimmedEmail === 'consumer@demo.com') {
          router.push('/consumer');
        } else if (trimmedEmail === 'business@demo.com') {
          router.push('/business');
        } else if (trimmedEmail === 'regulator@demo.com') {
          router.push('/regulator');
        } else {
          router.push('/consumer');
        }
        router.refresh();
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMessage(err.message || 'Unexpected authentication error');
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignIn(emailInput);
  };

  return (
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
          Authenticate with a registered account to access your role-protected compliance portal.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Manual Email Login Form */}
      <form
        onSubmit={handleManualSubmit}
        className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 backdrop-blur-xl shadow-2xl"
      >
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Account Email Sign In</span>
          </label>
          <input
            type="email"
            placeholder="e.g. consumer@demo.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={!emailInput || !!loadingEmail}
          className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
        >
          {loadingEmail === emailInput.toLowerCase().trim() ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          <span>Sign In to Portal</span>
        </button>
      </form>

      {/* 1-Click Demo Accounts Selector */}
      <div className="space-y-3 bg-slate-900/90 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Or Choose 1-Click Demo Persona:</span>
        </div>

        {/* 1. Consumer */}
        <button
          type="button"
          disabled={!!loadingEmail}
          onClick={() => handleSignIn('consumer@demo.com', '/consumer')}
          className="w-full group p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200 text-left flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-white group-hover:text-emerald-300">Ananya Sharma</h3>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  CONSUMER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">consumer@demo.com</p>
            </div>
          </div>
          {loadingEmail === 'consumer@demo.com' ? (
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          )}
        </button>

        {/* 2. Business */}
        <button
          type="button"
          disabled={!!loadingEmail}
          onClick={() => handleSignIn('business@demo.com', '/business')}
          className="w-full group p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-200 text-left flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300">Vikram Mehta</h3>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  BUSINESS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">business@demo.com</p>
            </div>
          </div>
          {loadingEmail === 'business@demo.com' ? (
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          )}
        </button>

        {/* 3. Regulator */}
        <button
          type="button"
          disabled={!!loadingEmail}
          onClick={() => handleSignIn('regulator@demo.com', '/regulator')}
          className="w-full group p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all duration-200 text-left flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-white group-hover:text-purple-300">DPA Officer</h3>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  REGULATOR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">regulator@demo.com</p>
            </div>
          </div>
          {loadingEmail === 'regulator@demo.com' ? (
            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          )}
        </button>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-mono">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>JWT Encrypted Sessions & Route-Level Guard</span>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-slate-950 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-slate-400 text-xs font-mono">Loading authentication portal...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
