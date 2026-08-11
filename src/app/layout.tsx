import type { Metadata } from 'next';
import './globals.css';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

export const metadata: Metadata = {
  title: 'ConsentFlow — DPDP Act 2023 Real-time Consent Manager Platform',
  description: 'AI-powered, DPDP Act 2023 compliant consent manager platform for citizens, businesses, and regulators with real-time SHA-256 audit trails.',
  keywords: ['DPDP Act 2023', 'Consent Manager', 'Privacy Compliance', 'Data Principal', 'Data Fiduciary', 'SHA-256 Audit Trail'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
