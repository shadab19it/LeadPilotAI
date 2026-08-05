import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: {
    default: 'LeadPilot AI — Lead Intelligence Platform',
    template: '%s | LeadPilot AI',
  },
  description:
    'AI-powered multi-source lead discovery and outreach platform for software agencies and freelancers.',
  keywords: ['lead generation', 'AI', 'software agency', 'outreach', 'CRM'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[var(--bg-base)] text-[var(--text-primary)] antialiased">
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-40 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
        </div>

        <div className="flex h-screen overflow-hidden relative">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 bg-grid">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
