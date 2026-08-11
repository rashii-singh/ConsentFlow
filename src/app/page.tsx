'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ConsumerView from '@/components/ConsumerView';
import BusinessView from '@/components/BusinessView';
import RegulatorView from '@/components/RegulatorView';
import SeedInspectorView from '@/components/SeedInspectorView';
import AuditTrailModal from '@/components/AuditTrailModal';
import { RefreshCw, Shield, AlertCircle } from 'lucide-react';

export default function Home() {
  const [activeRole, setActiveRole] = useState<'CONSUMER' | 'BUSINESS' | 'REGULATOR' | 'SEED_VIEW'>('CONSUMER');
  const [seedData, setSeedData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRecordId, setLoadingRecordId] = useState<string | null>(null);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<any | null>(null);

  // Fetch initial seed data status
  const fetchSeedData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/seed-status');
      const json = await res.json();
      setSeedData(json);
    } catch (err) {
      console.error('Failed to fetch seed status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeedData();
  }, []);

  // Handle Real-time Consent Toggling
  const handleToggleConsent = async (
    recordId: string,
    currentStatus: string,
    noticeId: string,
    businessId: string
  ) => {
    const action = currentStatus === 'GRANTED' ? 'REVOKE' : 'GRANT';
    setLoadingRecordId(recordId);

    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          action,
          noticeId,
          businessId,
          userId: 'usr_consumer',
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Optimistically update state
        setSeedData((prev: any) => {
          if (!prev || !prev.data || !prev.data.consentRecords) return prev;

          const updatedRecords = prev.data.consentRecords.map((r: any) => {
            if (r.id === recordId) {
              const newStatus = action === 'REVOKE' ? 'REVOKED' : 'GRANTED';
              const newLogs = [
                ...(r.auditLogs || []),
                {
                  id: `log_${Date.now()}`,
                  action: action,
                  timestamp: new Date().toISOString(),
                  previousHash: r.hash || 'GENESIS',
                  currentHash: data.hash || 'NEW_HASH',
                  metadata: `{"reason":"User requested ${action} via ConsentFlow Portal"}`,
                },
              ];

              return {
                ...r,
                status: newStatus,
                revokedAt: action === 'REVOKE' ? new Date().toISOString() : null,
                grantedAt: action === 'GRANT' ? new Date().toISOString() : r.grantedAt,
                hash: data.hash || r.hash,
                auditLogs: newLogs,
              };
            }
            return r;
          });

          return {
            ...prev,
            data: {
              ...prev.data,
              consentRecords: updatedRecords,
            },
          };
        });
      }
    } catch (err) {
      console.error('Failed to toggle consent:', err);
    } finally {
      setLoadingRecordId(null);
    }
  };

  const records = seedData?.data?.consentRecords || [];
  const businesses = seedData?.data?.businesses || [];
  const notices = seedData?.data?.notices || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        seedCounts={seedData?.counts}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs font-mono text-slate-400">Loading ConsentFlow DPDP Engine & Seed Records...</p>
          </div>
        ) : (
          <>
            {activeRole === 'CONSUMER' && (
              <ConsumerView
                records={records}
                onToggleConsent={handleToggleConsent}
                onInspectAudit={(rec) => setSelectedAuditRecord(rec)}
                loadingRecordId={loadingRecordId}
              />
            )}

            {activeRole === 'BUSINESS' && (
              <BusinessView
                businesses={businesses}
                notices={notices}
                records={records}
              />
            )}

            {activeRole === 'REGULATOR' && (
              <RegulatorView
                records={records}
                onInspectAudit={(rec) => setSelectedAuditRecord(rec)}
              />
            )}

            {activeRole === 'SEED_VIEW' && (
              <SeedInspectorView seedInfo={seedData} />
            )}
          </>
        )}

      </main>

      {/* Audit Trail Modal */}
      <AuditTrailModal
        record={selectedAuditRecord}
        onClose={() => setSelectedAuditRecord(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">ConsentFlow Engine v1.0</span>
            <span>— Aligned with DPDP Act 2023 Section 6(7)</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="hover:text-emerald-400 cursor-pointer" onClick={() => setActiveRole('SEED_VIEW')}>
              Seed Inspector
            </span>
            <span>|</span>
            <span>Prisma + Neon PostgreSQL</span>
            <span>|</span>
            <span>TypeScript + Next.js 15</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
