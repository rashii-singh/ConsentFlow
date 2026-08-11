'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Users, Building2, Eye, LogOut, Shield } from 'lucide-react';

export default function RoleSwitcher() {
  const { data: session } = useSession();

  const currentRole = session?.user?.role;
  const currentEmail = session?.user?.email;

  const handleRoleSwitch = async (email: string, targetPath: string) => {
    await signIn('credentials', {
      email,
      redirectTo: targetPath,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-xl max-w-xs text-xs space-y-2.5">
      
      {/* Session status header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">Demo Role Switcher</span>
        </div>
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {session?.user ? (
        <div className="text-[11px] text-slate-400 space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">Active:</span>
            <span className="font-semibold text-slate-200 truncate">{session.user.name}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">Role:</span>
            <span className="font-mono font-bold text-emerald-400">{currentRole}</span>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-amber-400">Not authenticated</div>
      )}

      {/* Quick Switch Buttons */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <button
          onClick={() => handleRoleSwitch('consumer@demo.com', '/consumer')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
            currentRole === 'CONSUMER'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Switch to Consumer"
        >
          <Users className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[9px] font-bold">Consumer</span>
        </button>

        <button
          onClick={() => handleRoleSwitch('business@demo.com', '/business')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
            currentRole === 'BUSINESS'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Switch to Business"
        >
          <Building2 className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[9px] font-bold">Business</span>
        </button>

        <button
          onClick={() => handleRoleSwitch('regulator@demo.com', '/regulator')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
            currentRole === 'REGULATOR'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Switch to Regulator"
        >
          <Eye className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[9px] font-bold">Regulator</span>
        </button>
      </div>

    </div>
  );
}
