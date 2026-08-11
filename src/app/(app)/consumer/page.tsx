import { auth } from '@/lib/auth/auth';
import RoleSwitcher from '@/components/RoleSwitcher';
import { UserCheck, ShieldCheck, Lock } from 'lucide-react';

export default async function ConsumerPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center relative">
      <RoleSwitcher />

      <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-6 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Protected Route: /consumer
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">Consumer Portal (Data Principal)</h1>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
          <div className="text-slate-400">Authenticated Session User:</div>
          <div className="text-slate-200">Name: {session?.user?.name}</div>
          <div className="text-slate-200">Email: {session?.user?.email}</div>
          <div className="text-emerald-400 font-bold">Role: {session?.user?.role}</div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Route protected by Auth.js middleware. Only CONSUMER role permitted.</span>
        </div>
      </div>
    </div>
  );
}
