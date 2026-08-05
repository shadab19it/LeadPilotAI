'use client';

import { useState } from 'react';
import { DiscoveryPanel } from '@/components/discover/DiscoveryPanel';
import { getDiscoveryJobs } from '@/lib/api';
import { formatRelativeDate } from '@/lib/utils';
import { useEffect } from 'react';
import { Compass, Clock, CheckCircle2, XCircle, Loader2, History } from 'lucide-react';

export default function DiscoverPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [newLeadsCount, setNewLeadsCount] = useState<number | null>(null);

  useEffect(() => {
    getDiscoveryJobs().then(setJobs).catch(() => {});
  }, []);

  const handleComplete = (added: number) => {
    setNewLeadsCount(added);
    getDiscoveryJobs().then(setJobs).catch(() => {});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
             style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow-blue)' }}>
          <Compass className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold gradient-text">Lead Discovery</h2>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-lg mx-auto">
          Automatically discover high-quality agencies and companies from multiple sources.
          AI will analyze and score each lead automatically.
        </p>
      </div>

      {/* Success notification */}
      {newLeadsCount !== null && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl animate-fade-slide-up"
             style={{ background: 'var(--accent-emerald-dim)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-400">Discovery Complete!</p>
            <p className="text-xs text-[var(--text-secondary)]">{newLeadsCount} new leads added to your database.</p>
          </div>
          <button onClick={() => setNewLeadsCount(null)} className="ml-auto text-emerald-400 hover:text-emerald-300">✕</button>
        </div>
      )}

      {/* Main Discovery Panel */}
      <DiscoveryPanel onComplete={handleComplete} />

      {/* Recent Jobs History */}
      {jobs.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-blue-400" /> Recent Discovery Jobs
          </h3>
          <div className="space-y-2">
            {jobs.slice(0, 8).map((job) => (
              <div key={job.jobId} className="flex items-center gap-3 p-3 rounded-xl"
                   style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="flex-shrink-0">
                  {job.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {job.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                  {(job.status === 'running' || job.status === 'pending') && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--text-primary)] capitalize">{job.status}</span>
                    <span className="text-xs text-[var(--text-muted)]">·</span>
                    <span className="text-xs text-[var(--text-muted)]">{formatRelativeDate(job.startedAt)}</span>
                  </div>
                  {job.status === 'completed' && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      Found {job.total} leads · Added {job.added} new
                    </p>
                  )}
                  {job.error && <p className="text-xs text-red-400 truncate">{job.error}</p>}
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono flex-shrink-0">
                  #{job.jobId.slice(0, 8)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: '🤖',
            title: 'AI-Powered Analysis',
            desc: 'Each discovered company is automatically analyzed and scored using AI.',
          },
          {
            icon: '🎯',
            title: 'Smart Scoring',
            desc: 'Leads are scored 0–100 based on team size, tech stack, hiring signals, and activity.',
          },
          {
            icon: '✉️',
            title: 'Ready for Outreach',
            desc: 'After discovery, generate personalized outreach drafts for each lead.',
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="glass-card p-4 text-center">
            <div className="text-3xl mb-2">{icon}</div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{title}</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
