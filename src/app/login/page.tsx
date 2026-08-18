'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { authenticate } from '@/lib/auth/actions';
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
  UserPlus,
  LogIn,
  User,
  Globe,
} from 'lucide-react';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl');

  // Mode: 'signin' or 'register'
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'CONSUMER' | 'BUSINESS' | 'REGULATOR'>('CONSUMER');
  const [regOrgName, setRegOrgName] = useState('');
  const [regLang, setRegLang] = useState('en');

  const [loading, setLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === 'CredentialsSignin'
      ? 'Authentication failed: Account not found. Please register or select a demo account.'
      : urlError
      ? `Authentication Error: ${urlError}`
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = async (email: string, targetPath?: string) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setLoadingEmail(trimmedEmail);
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const destination =
        targetPath ||
        callbackUrl ||
        (trimmedEmail === 'business@demo.com'
          ? '/business'
          : trimmedEmail === 'regulator@demo.com'
          ? '/regulator'
          : '/consumer');

      const res = await authenticate(trimmedEmail, destination);
      if (res && !res.success) {
        setErrorMessage(
          res.error ||
            'Authentication failed: Account not found. Please register an account below or select one of the demo personas.'
        );
      }
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
        return;
      }
      console.error('Sign in error:', err);
      setErrorMessage(err.message || 'Unexpected authentication error');
    } finally {
      setLoading(false);
      setLoadingEmail(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = regEmail.toLowerCase().trim();
    const trimmedName = regName.trim();

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Register user in database
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          role: regRole,
          organizationName: regRole === 'BUSINESS' ? regOrgName.trim() : undefined,
          preferredLang: regLang,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to register account');
      }

      setSuccessMessage('Account created successfully! Signing in...');

      // 2. Automatically sign in with newly registered account
      const destination =
        regRole === 'BUSINESS' ? '/business' : regRole === 'REGULATOR' ? '/regulator' : '/consumer';
      
      const authRes = await authenticate(trimmedEmail, destination);
      if (authRes && !authRes.success) {
        throw new Error(authRes.error || 'Account created, but sign-in failed. Please sign in manually.');
      }
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
        return;
      }
      console.error('Registration error:', err);
      setErrorMessage(err.message || 'An error occurred while creating your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6 relative z-10">
      
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
          Authenticate with a registered account or onboard as a new user to access your role-protected portal.
        </p>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      {/* Mode Tabs (Sign In / Register) */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'signin'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'register'
                ? 'bg-slate-800 text-emerald-400 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Tab 1: Sign In Form */}
        {activeTab === 'signin' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn(signInEmail);
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Account Email Address</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. yourname@example.com"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!signInEmail || loading}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
            >
              {loading && !loadingEmail ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>Sign In to Portal</span>
            </button>
          </form>
        )}

        {/* Tab 2: Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rashi Singh"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. rashi1912singh@gmail.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Account Role</span>
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-200 outline-none transition-all"
              >
                <option value="CONSUMER">Citizen / Data Principal (Consumer)</option>
                <option value="BUSINESS">Data Fiduciary / Enterprise (Business)</option>
                <option value="REGULATOR">Data Protection Authority Officer (Regulator)</option>
              </select>
            </div>

            {regRole === 'BUSINESS' && (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Organization Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. HealthCare Solutions Pvt Ltd"
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 border border-cyan-500/40 focus:border-cyan-400 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Preferred Language</span>
              </label>
              <select
                value={regLang}
                onChange={(e) => setRegLang(e.target.value)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-200 outline-none transition-all"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="te">Telugu (తెలుగు)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!regName || !regEmail || loading}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>Create Account & Sign In</span>
            </button>
          </form>
        )}
      </div>

      {/* 1-Click Demo Accounts Selector */}
      <div className="space-y-3 bg-slate-900/90 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Or Choose 1-Click Demo Persona:</span>
        </div>

        {/* 1. Consumer */}
        <button
          type="button"
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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
