'use client';

import { useState, useEffect } from 'react';
import type { LeadSource } from '@leadpilot/types';
import { startDiscovery, getDiscoveryStatus } from '@/lib/api';
import {
  Play, Square, CheckCircle2, XCircle, Loader2,
  Globe, Github, Search, Star, Building2, Compass,
  ToggleLeft, ToggleRight,
} from 'lucide-react';

const SOURCE_OPTIONS: Array<{ source: LeadSource; label: string; icon: string; color: string }> = [
  { source: 'LinkedIn', label: 'LinkedIn', icon: '💼', color: '#0a66c2' },
  { source: 'Clutch', label: 'Clutch.co', icon: '🏆', color: '#ef4444' },
  { source: 'GoodFirms', label: 'GoodFirms', icon: '✅', color: '#3b82f6' },
  { source: 'GitHub', label: 'GitHub Orgs', icon: '⌨️', color: '#f9f9f9' },
  { source: 'Product Hunt', label: 'Product Hunt', icon: '🚀', color: '#f97316' },
  { source: 'YC', label: 'Y Combinator', icon: '🔶', color: '#f59e0b' },
  { source: 'Wellfound', label: 'Wellfound', icon: '🌟', color: '#10b981' },
  { source: 'DesignRush', label: 'DesignRush', icon: '🎨', color: '#8b5cf6' },
  { source: 'Google', label: 'Google Search', icon: '🔍', color: '#06b6d4' },
];

const DEFAULT_SOURCES: LeadSource[] = ['LinkedIn', 'Clutch', 'GoodFirms', 'GitHub', 'Product Hunt', 'YC'];

interface DiscoveryPanelProps {
  onComplete?: (added: number) => void;
}

export function DiscoveryPanel({ onComplete }: DiscoveryPanelProps) {
  const [selectedSources, setSelectedSources] = useState<LeadSource[]>(DEFAULT_SOURCES);
  const [searchTerms, setSearchTerms] = useState('software development agency, web development company, digital agency');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll job status
  useEffect(() => {
    if (!jobId || jobStatus?.status === 'completed' || jobStatus?.status === 'failed') return;
    const interval = setInterval(async () => {
      try {
        const status = await getDiscoveryStatus(jobId);
        setJobStatus(status);
        if (status.status === 'completed') {
          onComplete?.(status.added);
        }
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId, jobStatus?.status, onComplete]);

  const toggleSource = (source: LeadSource) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const handleStart = async () => {
    if (!selectedSources.length) { setError('Select at least one source'); return; }
    setError(null);
    setIsStarting(true);
    setJobStatus(null);
    try {
      const terms = searchTerms.split(',').map((t) => t.trim()).filter(Boolean);
      const { jobId: id } = await startDiscovery({ sources: selectedSources, searchTerms: terms });
      setJobId(id);
      setJobStatus({ status: 'pending', progress: 0, total: 0, added: 0, startedAt: new Date().toISOString() });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to start discovery');
    } finally {
      setIsStarting(false);
    }
  };

  const isRunning = jobStatus?.status === 'running' || jobStatus?.status === 'pending';
  const isCompleted = jobStatus?.status === 'completed';
  const isFailed = jobStatus?.status === 'failed';

  return (
    <div className="space-y-6">
      {/* Source Selection */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-400" /> Discovery Sources
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Select platforms to discover leads from. Real scrapers + demo data included.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SOURCE_OPTIONS.map(({ source, label, icon, color }) => {
            const isSelected = selectedSources.includes(source);
            return (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                disabled={isRunning}
                className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border text-left"
                style={{
                  background: isSelected ? `${color}12` : 'var(--bg-secondary)',
                  borderColor: isSelected ? `${color}50` : 'var(--border)',
                  color: isSelected ? color : 'var(--text-secondary)',
                }}
              >
                <span className="text-base">{icon}</span>
                <span className="text-xs leading-tight">{label}</span>
                <span className="ml-auto">
                  {isSelected
                    ? <ToggleRight className="w-4 h-4 flex-shrink-0" />
                    : <ToggleLeft className="w-4 h-4 flex-shrink-0 opacity-40" />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-[var(--text-muted)]">
          {selectedSources.length} of {SOURCE_OPTIONS.length} sources selected
        </div>
      </div>

      {/* Search Terms */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-400" /> Search Terms
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-3">Comma-separated search queries for discovery</p>
        <textarea
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
          rows={3}
          disabled={isRunning}
          placeholder="e.g. software development agency, react developer"
          className="input-base text-sm resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
             style={{ background: 'var(--accent-red-dim)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-red)' }}>
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Job Status */}
      {jobStatus && (
        <div className="glass-card p-5 space-y-3 animate-fade-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isRunning && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
              {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isFailed && <XCircle className="w-4 h-4 text-red-400" />}
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {isRunning ? 'Discovery in Progress...' : isCompleted ? 'Discovery Complete!' : 'Discovery Failed'}
              </span>
            </div>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
              style={{
                color: isCompleted ? 'var(--accent-emerald)' : isFailed ? 'var(--accent-red)' : 'var(--accent-blue)',
                background: isCompleted ? 'var(--accent-emerald-dim)' : isFailed ? 'var(--accent-red-dim)' : 'var(--accent-blue-dim)',
              }}
            >
              {jobStatus.status}
            </span>
          </div>

          {/* Progress bar */}
          {isRunning && (
            <div className="progress-bar">
              <div className="progress-fill animate-pulse" style={{ width: '60%' }} />
            </div>
          )}

          {/* Stats */}
          {(isCompleted || isFailed) && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Found', value: jobStatus.total || 0, color: 'var(--accent-blue)' },
                { label: 'Added', value: jobStatus.added || 0, color: 'var(--accent-emerald)' },
                { label: 'Status', value: jobStatus.status, color: isCompleted ? 'var(--accent-emerald)' : 'var(--accent-red)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="text-lg font-bold" style={{ color }}>{value}</div>
                  <div className="text-xs text-[var(--text-muted)]">{label}</div>
                </div>
              ))}
            </div>
          )}

          {jobStatus.error && (
            <p className="text-xs text-red-400 mt-1">{jobStatus.error}</p>
          )}
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={isRunning || isStarting || !selectedSources.length}
        className="btn-primary w-full justify-center py-3 text-base"
      >
        {isRunning || isStarting ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Running Discovery...</>
        ) : (
          <><Play className="w-5 h-5" /> Start Discovery ({selectedSources.length} sources)</>
        )}
      </button>

      {/* Info */}
      <p className="text-center text-xs text-[var(--text-muted)]">
        Discovery runs in the background. Results are saved automatically to your lead database.
      </p>
    </div>
  );
}
