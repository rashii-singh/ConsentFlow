import Link from 'next/link';
import RoleSwitcher from '@/components/RoleSwitcher';
import {
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  Lock,
  Hash,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Building2,
  UserCheck,
  Scale,
  Clock,
  ChevronRight,
  Globe,
  Database,
  Cpu,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      <RoleSwitcher />

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">ConsentFlow</span>
              <span className="text-[10px] font-mono text-emerald-400 block -mt-1 font-bold">DPDP ACT 2023 SAAS</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="py-2.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <span>Launch Demo App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-20 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Groq Llama 3.1 8B AI + SHA-256 Cryptographic Audit Chain</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Intelligent Consent Management Platform for{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            DPDP Act 2023
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-normal">
          Empowering citizens with AI plain-language consent notices in 5 Indic languages, while providing Data Fiduciaries and Regulators with immutable SHA-256 audit chains and serverless HMAC webhooks.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="py-4 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center space-x-2 shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <UserCheck className="w-5 h-5" />
            <span>Try Consumer Demo Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="py-4 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center space-x-2 active:scale-95"
          >
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span>Fiduciary Business Portal</span>
          </Link>

          <Link
            href="/login"
            className="py-4 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center space-x-2 active:scale-95"
          >
            <Eye className="w-5 h-5 text-purple-400" />
            <span>Regulator Inspector Tool</span>
          </Link>
        </div>
      </section>

      {/* 2. STAT CARDS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Statutory Penalty</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-black text-rose-400">₹250 Cr</div>
            <p className="text-xs text-slate-400">Max DPDP penalty per compliance breach</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Citizen Friction</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-400">90%</div>
            <p className="text-xs text-slate-400">Users confused by legal jargon without AI</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Fiduciary Market</span>
              <Building2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-400">12,000+</div>
            <p className="text-xs text-slate-400">Data Fiduciaries in India requiring compliance</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Audit Effort</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">0 Manual</div>
            <p className="text-xs text-slate-400">Automated SHA-256 cryptographic chain</p>
          </div>

        </div>
      </section>

      {/* 3. PAIN POINTS 3-COLUMN SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            The DPDP Act 2023 Compliance Challenge
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Why traditional legal notices fail citizens, businesses, and regulatory auditors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Dense Legal Jargon Friction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard 20-page privacy policies are incomprehensible for average citizens. DPDP Section 6 mandates plain-language notices in 22 official Indian languages.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">2. High Penalty & SLA Risk</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Failure to honor 1-tap consent withdrawal or breach of the 30-day statutory grievance SLA carries statutory fines up to ₹250 Crore per incident.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Hash className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Vulnerable Audit Records</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traditional database logs can be retroactively altered or corrupted. Regulators require immutable proof of what notice and choices were granted.
            </p>
          </div>

        </div>
      </section>

      {/* 4. 5-LAYER ARCHITECTURE DIAGRAM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/30">
            <Layers className="w-4 h-4" />
            <span>Architecture Breakdown</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            5-Layer Serverless SaaS Architecture
          </h2>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
          
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Layer 1: Multi-Role Presentation</span>
              <h4 className="text-sm font-bold text-white">Consumer, Fiduciary Business, & Regulator Inspector Portals</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">Next.js 15 App Router + Tailwind CSS</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Layer 2: AI Simplification Engine</span>
              <h4 className="text-sm font-bold text-white">Groq Llama 3.1 8B Instant (EN, HI, KN, TA, TE) + Multilingual Fallback</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">Strict JSON Output + 6s Timeout</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Layer 3: Cryptographic Audit Engine</span>
              <h4 className="text-sm font-bold text-white">Canonical SHA-256 Hash Chain SHA256(previousHash + payload)</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">Genesis Node &rarr; Leaf Hash Verification</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Layer 4: Serverless Webhook Dispatcher</span>
              <h4 className="text-sm font-bold text-white">HMAC-SHA256 Signed Payloads + Exponential Backoff & DLQ</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">cron-job.org / Vercel Serverless</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Layer 5: Database & ORM</span>
              <h4 className="text-sm font-bold text-white">PostgreSQL on Neon Serverless DB via Prisma 5.x</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">Full 7-Model V2 Schema</span>
          </div>

        </div>
      </section>

      {/* 5. 7-STEP LIFECYCLE FLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            7-Step End-to-End Consent Lifecycle
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Notice Creation', desc: 'Fiduciary drafts privacy notice and processing purposes.' },
            { step: '2', title: 'AI Simplification', desc: 'Groq Llama 3.1 8B translates notice into 5 Indic languages.' },
            { step: '3', title: 'Granular Choices', desc: 'Citizen configures essential & optional data toggles.' },
            { step: '4', title: 'SHA-256 Audit Chain', desc: 'Consent grant writes chained immutable SHA-256 block.' },
            { step: '5', title: 'HMAC Webhook', desc: 'Signed payload delivered synchronously to business backend.' },
            { step: '6', title: '1-Tap Revocation', desc: 'Citizen revokes consent instantly per statutory right.' },
            { step: '7', title: 'Regulator Audit', desc: 'Inspector verifies hash chain and issues certificate.' },
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-xs">
                #{item.step}
              </span>
              <h4 className="text-sm font-bold text-white pt-1">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. USE CASES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Industry Use Cases
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10">
              Healthcare & HealthTech
            </span>
            <h3 className="text-lg font-bold text-white">Tele-Consultations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Patients review simplified medical record sharing notices before sharing diagnostic lab reports with online specialists.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10">
              E-Commerce & Retail
            </span>
            <h3 className="text-lg font-bold text-white">Personalized Offers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Customers toggle optional marketing choices while keeping order fulfillment processing enabled.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-bold px-2 py-0.5 rounded bg-purple-500/10">
              FinTech & Banking
            </span>
            <h3 className="text-lg font-bold text-white">KYC Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Encrypted digital identity verification with full audit trails for high-value transaction fraud prevention.
            </p>
          </div>
        </div>
      </section>

      {/* 7. PRICING TIERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Simple, Transparent Pricing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-slate-400">STARTER FIDUCIARY</span>
              <div className="text-3xl font-black text-white">₹9,999 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Up to 10,000 Active Consents</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Groq AI Notice Simplifier</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>SHA-256 Audit Chaining</span></li>
              </ul>
            </div>
            <Link href="/login" className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors">Start Free Trial</Link>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500 space-y-6 flex flex-col justify-between shadow-2xl relative">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider">POPULAR</span>
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-emerald-400">GROWTH FIDUCIARY</span>
              <div className="text-3xl font-black text-white">₹24,999 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Up to 100,000 Active Consents</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Signed HMAC Webhooks & DLQ</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Grievance SLA Desk</span></li>
              </ul>
            </div>
            <Link href="/login" className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center transition-colors">Get Started</Link>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-purple-400">SIGNIFICANT FIDUCIARY</span>
              <div className="text-3xl font-black text-white">Custom</div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /><span>Unlimited Consents & Webhooks</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /><span>Dedicated Data Protection Officer</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /><span>Regulator Audit Export APIs</span></li>
              </ul>
            </div>
            <Link href="/login" className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-center text-xs text-slate-500 space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-slate-200">ConsentFlow V2 — DPDP Act 2023 Compliance Platform</span>
        </div>
        <p className="max-w-xl mx-auto">
          Built for the DPDP Act 2023 Hackathon with Next.js 15, Prisma 5, Neon Postgres, Auth.js v5, Groq Llama 3.1 8B, and Cryptographic Hash Chains.
        </p>
      </footer>
    </div>
  );
}
